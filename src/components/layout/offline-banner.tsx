import { CloudOff } from "lucide-react";

import { useOnline } from "@/lib/use-online";

/**
 * Avisa que o que está na tela é do último carregamento.
 *
 * Com a programação guardada, o app offline deixa de ficar vazio — mas mostrar
 * evento de ontem sem dizer nada é pior que mostrar nada. A faixa é a diferença
 * entre "o app está desatualizado" e "o app mentiu para mim".
 */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-brand-tint-strong px-4 py-2 text-center text-xs font-medium text-brand-wine"
    >
      <CloudOff className="size-3.5 shrink-0" aria-hidden />
      Sem conexão — mostrando o que carregou por último
    </div>
  );
}
