import { createFileRoute } from "@tanstack/react-router";
import { HeartOff } from "lucide-react";

import { EventRow } from "@/components/event/event-row";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { store } from "@/data/store";
import { SITE } from "@/data/config";
import { useEvents } from "@/hooks/use-events";
import { useFavoriteCount } from "@/hooks/use-store";
import { byDate } from "@/lib/format";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [{ title: `Meus favoritos — ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  // O contador vem do store para a lista reagir ao coração de qualquer card.
  const count = useFavoriteCount();
  const { data: events = [], isLoading } = useEvents();

  const favoriteIds = new Set(store.favorites());
  const favorites = events.filter((event) => favoriteIds.has(event.id)).sort(byDate);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Meus favoritos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count === 0
            ? "Nada salvo ainda."
            : `${count} ${count === 1 ? "evento salvo" : "eventos salvos"}`}
        </p>

        <div className="mt-6 space-y-3">
          {isLoading ? null : favorites.length ? (
            favorites.map((event) => <EventRow key={event.id} event={event} />)
          ) : (
            <EmptyState
              icon={HeartOff}
              title="Nenhum evento favoritado."
              description="Quando você favoritar o evento, vai encontrá-lo aqui!"
              action={{ to: "/busca", label: "Buscar eventos" }}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
