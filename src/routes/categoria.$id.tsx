import { createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarX } from "lucide-react";

import { EventCard, EventCardSkeleton } from "@/components/event/event-card";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/data/api";
import { SITE } from "@/data/config";
import { useEvents } from "@/hooks/use-events";
import { byDate, isUpcoming } from "@/lib/format";

export const Route = createFileRoute("/categoria/$id")({
  loader: async ({ params }) => {
    const categories = await api.categories();
    const category = categories.find((item) => item.id === Number(params.id));
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category;
    if (!category) return {};
    return {
      meta: [
        { title: `${category.name} — ${SITE.name}` },
        {
          name: "description",
          content: `Eventos de ${category.name.toLowerCase()} em Porto Alegre.`,
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { data: events = [], isLoading } = useEvents();

  const list = events
    .filter((event) => event.categories.some((item) => item.id === category.id))
    .sort(byDate);

  const upcoming = list.filter((event) => isUpcoming(event));
  const past = list.filter((event) => !isUpcoming(event));

  return (
    <AppShell>
      <header className="relative">
        <div className="relative h-44 overflow-hidden sm:h-56">
          {category.url ? (
            <img src={category.url} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-brand-blob" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/25" />
        </div>

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-5">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{category.name}</h1>
          <p className="mt-1 text-sm text-white/80">
            {isLoading
              ? "Carregando..."
              : `${upcoming.length} ${upcoming.length === 1 ? "evento" : "eventos"} por vir`}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {isLoading ? (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index}>
                <EventCardSkeleton />
              </li>
            ))}
          </ul>
        ) : upcoming.length ? (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {upcoming.map((event) => (
              <li key={event.id}>
                <EventCard event={event} className="h-full" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={CalendarX}
            title="Nenhum evento encontrado."
            description="Quem sabe em outra categoria."
            action={{ to: "/busca", label: "Buscar eventos" }}
          />
        )}

        {past.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-muted-foreground">Já rolou</h2>
            <ul className="grid grid-cols-2 gap-4 opacity-70 lg:grid-cols-4">
              {past.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <EventCard event={event} className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
