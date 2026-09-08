/**
 * Service worker do Poa na Rua.
 *
 * Escrito à mão, sem Workbox, porque o app tem só duas necessidades: abrir
 * offline e não servir HTML velho. As estratégias são as mínimas para isso.
 *
 * - Navegação: rede primeiro, cai para o cache e, em último caso, para a
 *   página offline. Assim ninguém vê uma versão antiga do site estando online.
 * - Assets com hash no nome (/_build/, /assets/): cache primeiro, porque o
 *   nome muda a cada deploy e o conteúdo é imutável.
 * - Imagens: cache primeiro com atualização em segundo plano.
 *
 * O admin e qualquer coisa fora do GET nunca são cacheados.
 */

const VERSION = "v1";
const SHELL_CACHE = `poanarua-shell-${VERSION}`;
const ASSET_CACHE = `poanarua-assets-${VERSION}`;
const IMAGE_CACHE = `poanarua-images-${VERSION}`;

const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/logo-poa-na-rua.svg", "/manifest.webmanifest"];

const MAX_IMAGES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Permite que a página peça a troca imediata quando há versão nova. */
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    throw error;
  }
}

async function cacheFirst(request, cacheName, max) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (max) trimCache(cacheName, max);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // O admin sempre vai à rede: dado velho ali confunde a curadoria.
  if (url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    // Imagens de terceiros (capas de evento) valem cache; o resto não.
    if (request.destination === "image") {
      event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES).catch(() => Response.error()));
    }
    return;
  }

  if (/\/(_build|assets)\//.test(url.pathname) || /\.(js|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
  }
});
