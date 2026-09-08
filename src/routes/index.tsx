import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, PartyPopper } from "lucide-react";

import { EventRow, EventRowSkeleton } from "@/components/event/event-row";
import { CategoryGrid, CategoryGridSkeleton } from "@/components/home/category-grid";
import { EventRail, EventRailSkeleton } from "@/components/home/event-rail";
import { HeroCarousel, HeroSkeleton } from "@/components/home/hero-carousel";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/config";
import { useCategories, useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-store";
import { byDate, isHappeningToday, isUpcoming } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: events = [], isLoading } = useEvents();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const user = useUser();

  const highlights = events.filter((event) => event.banner === "TOP");
  const today = events.filter((event) => isHappeningToday(event)).sort(byDate);
  const soon = events
    .filter((event) => isUpcoming(event) && !isHappeningToday(event))
    .sort(byDate)
    .slice(0, 6);
  const firstName = user?.name?.split(" ")[0];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {firstName ? `Olá, ${firstName} ;)` : "Tudo que acontece em Porto Alegre"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Todos os dias. Em um só lugar.</p>
          </div>

          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/cadastrar-evento">
              <CalendarPlus className="size-4" />
              Cadastrar evento
            </Link>
          </Button>
        </div>

        {isLoading ? <HeroSkeleton /> : <HeroCarousel events={highlights} />}
      </div>

      <Section
        title="Hoje Tem :)"
        description="O que rola na cidade hoje"
        action={{ to: "/busca", label: "Ver tudo" }}
      >
        {isLoading ? (
          <EventRailSkeleton />
        ) : today.length ? (
          <EventRail events={today} />
        ) : (
          <EmptyState
            icon={PartyPopper}
            title="Hoje a rua tá quieta."
            description="Nenhum evento marcado para hoje — dá uma olhada no que vem por aí."
            action={{ to: "/busca", label: "Buscar eventos" }}
          />
        )}
      </Section>

      <Section title="Bora curtir POA?" description="Escolhe por onde começar">
        {loadingCategories ? <CategoryGridSkeleton /> : <CategoryGrid categories={categories} />}
      </Section>

      {(isLoading || soon.length > 0) && (
        <Section title="Vem por aí" description="Já marca no calendário">
          {isLoading ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <EventRowSkeleton key={index} />
              ))}
            </div>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {soon.map((event) => (
                <li key={event.id}>
                  <EventRow event={event} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-10">
          <div className="absolute inset-0 bg-brand-blob" aria-hidden />
          {/* A mancha da marca é clara demais no canto superior; a camada escura
              garante contraste do texto branco em todo o gradiente. */}
          <div className="absolute inset-0 bg-brand-ink/55" aria-hidden />

          <div className="relative">
            <h2 className="max-w-lg text-balance text-2xl font-bold leading-tight text-white sm:text-3xl">
              Organiza um rolê de rua? Coloca ele no mapa.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/90">
              Feira, show, bazar, sarau — cadastra de graça e apareça para quem está procurando o
              que fazer em Porto Alegre.
            </p>
            <Button asChild variant="secondary" className="mt-6">
              <Link to="/cadastrar-evento">
                <CalendarPlus className="size-4" />
                Cadastrar meu evento
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
