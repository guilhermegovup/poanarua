/**
 * Registro do service worker e aviso de versão nova.
 *
 * Só roda em produção: em desenvolvimento um SW cacheando o bundle atrapalha
 * mais do que ajuda. Se houver um SW antigo registrado numa sessão de dev, ele
 * é removido.
 */

/** Chamado quando existe uma versão nova esperando para assumir. */
type OnUpdate = (apply: () => void) => void;

/**
 * O `?v=` é o que faz o navegador enxergar versão nova: ele compara a URL do
 * worker byte a byte com a registrada, e o arquivo em si pode não ter mudado
 * entre dois deploys. O worker também lê esse valor para nomear os caches.
 */
const SW_URL = `/sw.js?v=${__BUILD_ID__}`;

export function registerServiceWorker(onUpdate?: OnUpdate) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((item) => item.unregister()))
      .catch(() => undefined);
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        if (!onUpdate) return;

        const announce = (worker: ServiceWorker | null) => {
          if (!worker) return;

          const check = () => {
            // "installed" com um controlador ativo significa: versão nova
            // pronta, esperando a antiga sair. Sem controlador é a primeira
            // instalação, que não é atualização nenhuma.
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              onUpdate(() => {
                worker.postMessage("skip-waiting");
              });
            }
          };

          check();
          worker.addEventListener("statechange", check);
        };

        announce(registration.waiting);
        registration.addEventListener("updatefound", () => announce(registration.installing));
      })
      .catch((error) => {
        console.warn("Service worker não registrou:", error);
      });

    // Quando o worker novo assume, a página recarrega uma vez para passar a
    // rodar o código dele. O guarda evita o laço de recargas.
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  });
}
