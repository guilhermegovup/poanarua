import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Esconde o nome e deixa só a marca gráfica. */
  iconOnly?: boolean;
}

/**
 * A marca é servida de `public/` (vetor original) para o site não depender de
 * nenhum CDN externo.
 */
export function Brand({ className, iconOnly = false }: Props) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src="/logo-poa-na-rua.svg"
        alt="Poa na Rua"
        className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
        width={40}
        height={40}
      />
      {!iconOnly && (
        <span className="sr-only sm:not-sr-only sm:text-base sm:font-bold sm:tracking-tight">
          Poa na Rua
        </span>
      )}
    </span>
  );
}
