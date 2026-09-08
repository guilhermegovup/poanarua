import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

import { EventRow, EventRowSkeleton } from "@/components/event/event-row";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { SITE } from "@/data/config";
import type { Category } from "@/data/types";
import { useCategories, useEvents } from "@/hooks/use-events";
import { byDate, isUpcoming } from "@/lib/format";
import { htmlToPlainText } from "@/lib/html";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [
      { title: `Buscar eventos — ${SITE.name}` },
      {
        name: "description",
        content: "Procure por feiras, shows, gastronomia e eventos de rua em Porto Alegre.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { data: events = [], isLoading } = useEvents();
  const { data: categories = [] } = useCategories();

  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();

    return events
      .filter((event) => {
        if (onlyUpcoming && !isUpcoming(event)) return false;
        if (category && !event.categories.some((item) => item.id === category.id)) {
          return false;
        }
        if (!needle) return true;

        const haystack = [
          event.name,
          event.address,
          htmlToPlainText(event.description),
          ...event.tags.map((tag) => tag.name),
          ...event.categories.map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(needle);
      })
      .sort(byDate);
  }, [category, events, onlyUpcoming, term]);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buscar eventos</h1>
        <p className="mt-1 text-sm text-muted-foreground">O que tu quer fazer?</p>

        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Feira, show, praça, gastronomia..."
          className="mt-5 h-12"
          type="search"
          aria-label="Buscar eventos"
        />

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <FilterChip active={onlyUpcoming} onClick={() => setOnlyUpcoming((v) => !v)}>
            Só o que vem por aí
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.id}
              active={category?.id === item.id}
              onClick={() => setCategory(category?.id === item.id ? null : item)}
            >
              {item.name}
            </FilterChip>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {isLoading
            ? "Procurando..."
            : `${results.length} ${results.length === 1 ? "evento" : "eventos"}`}
        </p>

        <div className="mt-3 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <EventRowSkeleton key={index} />)
          ) : results.length ? (
            results.map((event) => <EventRow key={event.id} event={event} />)
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nenhum evento encontrado."
              description="Tente buscar com outros parâmetros."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
