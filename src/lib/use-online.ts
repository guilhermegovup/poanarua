import { useEffect, useState } from "react";

/**
 * Se o aparelho está com rede.
 *
 * Começa otimista: no servidor e no primeiro render `navigator` pode não
 * existir, e assumir "offline" faria a faixa piscar em toda abertura.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
