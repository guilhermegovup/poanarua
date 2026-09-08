import { QUICK_FILTERS, type QuickFilterId } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface Props {
  active: QuickFilterId[];
  counts: Record<QuickFilterId, number>;
  onToggle: (id: QuickFilterId) => void;
}

/**
 * A faixa que responde "o que eu faço hoje". Fica logo abaixo do destaque
 * porque é a primeira decisão de quem chega, não um refinamento posterior.
 *
 * Rola na horizontal no celular, cabe inteira a partir do tablet.
 */
export function QuickFilters({ active, counts, onToggle }: Props) {
  return (
    <div
      role="group"
      aria-label="Filtrar por quando e por quem"
      className="no-scrollbar fade-edge -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {QUICK_FILTERS.map((filter) => {
        const on = active.includes(filter.id);
        const count = counts[filter.id] ?? 0;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onToggle(filter.id)}
            aria-pressed={on}
            disabled={count === 0 && !on}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
              // 44px de alvo de toque, o mínimo confortável no polegar
              "h-11 transition-[background-color,border-color,color,box-shadow] duration-200",
              on
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent",
              count === 0 &&
                !on &&
                "cursor-not-allowed opacity-40 hover:border-border hover:bg-card",
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                on ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
