/**
 * Registro do service worker.
 *
 * Só roda em produção: em desenvolvimento um SW cacheando o bundle atrapalha
 * mais do que ajuda. Se houver um SW antigo registrado numa sessão de dev, ele
 * é removido.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((item) => item.unregister()))
      .catch(() => undefined);
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker não registrou:", error);
    });
  });
}
