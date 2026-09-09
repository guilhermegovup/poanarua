import { Download, Share, X } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/install-prompt";

/**
 * Faixa que convida a botar o Poa na Rua na tela inicial.
 *
 * Aparece a partir da segunda visita e some por trinta dias se a pessoa
 * dispensar: convite na primeira abertura é propaganda, na segunda é oferta.
 */
export function InstallInvite() {
  const { kind, install, dismiss } = useInstallPrompt();

  if (!kind) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 px-4 md:bottom-4 md:left-auto md:right-4 md:w-80 md:px-0">
      <div className="relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lift">
        <Brand iconOnly />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">Deixa o Poa na Rua na tela inicial</p>

          {kind === "ios" ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
              Toca em
              <Share className="inline size-3.5 shrink-0" aria-label="Compartilhar" />e depois em{" "}
              <strong className="font-medium">Adicionar à Tela de Início</strong>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Abre direto, e funciona sem sinal</p>
          )}
        </div>

        {kind === "prompt" && (
          <Button size="sm" onClick={install} className="shrink-0">
            <Download className="size-4" />
            Instalar
          </Button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Agora não"
          className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
