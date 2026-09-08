import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, CalendarX, PartyPopper, WifiOff } from "lucide-react";

import { EventCard, EventCardSkeleton } from "@/components/event/event-card";
import { EventRow, EventRowSkeleton } from "@/components/event/event-row";
import { CategoryRail, CategoryRailSkeleton } from "@/components/home/category-rail";
import { HeroCarousel, HeroSkeleton } from "@/components/home/hero-carousel";
import { QuickFilters } from "@/components/home/quick-filters";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/config";
import { useCategories, useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-store";
import {
  applyQuickFilters,
  countByFilter,
  findQuickFilter,
  type QuickFilterId,
} from "@/lib/filters";
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
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const user = useUser();

  const [active, setActive] = useState<QuickFilterId[]>([]);

  const counts = useMemo(() => countByFilter(events), [events]);
  const filtered = useMemo(() => applyQuickFilters(events, active).sort(byDate), [events, active]);

  const highlights = events.filter((event) => event.banner === "TOP");
  const today = events.filter((event) => isHappeningToday(event)).sort(byDate);
  const soon = events
    .filter((event) => isUpcoming(event) && !isHappeningToday(event))
    .sort(byDate)
    .slice(0, 6);

  const firstName = user?.name?.split(" ")[0];
  const filtering = active.length > 0;

  function toggle(id: QuickFilterId) {
    setActive((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-2xl px-4 py-20">
          <EmptyState
            icon={WifiOff}
            title="Não consegui carregar a programação."
            description="Pode ser a tua conexão ou o nosso servidor. Tenta de novo em instantes."
          />
          <div className="mt-6 flex justify-center">
            <Button onClick={() => refetch()}>Tentar de novo</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-balance text-[1.6rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
              {firstName ? `Olá, ${firstName} ;)` : "Tudo que acontece em Porto Alegre"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Todos os dias. Em um só lugar.</p>
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

      {/* A primeira decisão de quem chega: quando, e para quem. */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <QuickFilters active={active} counts={counts} onToggle={toggle} />
      </div>

      {filtering ? (
        <Section
          title={active
            .map((id) => findQuickFilter(id)?.label)
            .filter(Boolean)
            .join(" · ")}
          description={`${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}`}
        >
          {filtered.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} className="h-full" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarX}
              title="Nada com esse recorte."
              description="Tira um filtro ou dá uma olhada no que vem por aí."
            />
          )}
        </Section>
      ) : (
        <>
          <Section
            title="Hoje Tem :)"
            description="O que rola na cidade hoje"
            action={{ to: "/busca", label: "Ver tudo" }}
          >
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <EventCardSkeleton key={index} />
                ))}
              </div>
            ) : today.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {today.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} className="h-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={PartyPopper}
                title="Hoje a rua tá quieta."
                description="Nenhum evento marcado para hoje — dá uma olhada no que vem por aí."
                action={{ to: "/busca", label: "Buscar eventos" }}
              />
            )}
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
        </>
      )}

      <Section title="Bora curtir POA?" description="Escolhe por onde começar">
        {loadingCategories ? <CategoryRailSkeleton /> : <CategoryRail categories={categories} />}
      </Section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-brand-wine p-6 sm:p-10">
          {/* A mancha da marca entra como textura sobre o vinho sólido; escurecer
              o gradiente inteiro dava um marrom sujo. */}
          <div
            className="absolute inset-0 bg-brand-blob opacity-45 mix-blend-overlay"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-brand-ink/45 via-transparent to-transparent"
            aria-hidden
          />

          <div className="relative">
            <h2 className="max-w-lg text-balance text-2xl font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-3xl">
              Organiza um rolê de rua? Coloca ele no mapa.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/85">
              Feira, show, bazar, sarau — cadastra de graça e apareça para quem está procurando o
              que fazer em Porto Alegre.
            </p>
            <Button asChild variant="secondary" className="mt-6 shadow-card">
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
