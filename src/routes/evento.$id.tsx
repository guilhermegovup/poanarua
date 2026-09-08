import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { EventCard } from "@/components/event/event-card";
import { FavoriteButton } from "@/components/event/favorite-button";
import { GoEvent } from "@/components/event/go-event";
import { Opinions } from "@/components/event/opinions";
import { AppShell } from "@/components/layout/app-shell";
import { HtmlText } from "@/components/shared/html-text";
import { Section } from "@/components/shared/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { useEvents } from "@/hooks/use-events";
import { SITE } from "@/data/config";
import type { EventItem } from "@/data/types";
import { byDate, formatHour, formatLongDate, isUpcoming } from "@/lib/format";
import { htmlToPlainText } from "@/lib/html";
import {
  CONTACT_LABEL,
  contactUrl,
  googleMapsUrl,
  shareEvent,
  staticMapUrl,
  wazeUrl,
} from "@/lib/links";

export const Route = createFileRoute("/evento/$id")({
  loader: async ({ params }) => {
    const event = await api.event(Number(params.id));
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    const event = loaderData?.event;
    if (!event) return {};

    const description = htmlToPlainText(event.description).slice(0, 180);
    return {
      meta: [
        { title: `${event.name} — ${SITE.name}` },
        { name: "description", content: description },
        { property: "og:title", content: event.name },
        { property: "og:description", content: description },
        { property: "og:image", content: event.image.url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EventPage,
});

function EventPage() {
  const { event } = Route.useLoaderData();
  const location = event.locations?.[0];
  const hasCoordinates =
    !!location && String(location.latitude).length > 0 && String(location.longitude).length > 0;

  const contacts = event.contacts.filter((contact) => contact.value.trim());

  async function share() {
    await shareEvent(event);
    if (typeof navigator !== "undefined" && !navigator.share) {
      toast("Link copiado!", { description: "Cola onde quiser." });
    }
  }

  return (
    <AppShell>
      <article>
        <div className="relative">
          <div className="aspect-[4/3] w-full overflow-hidden bg-secondary sm:aspect-[21/9]">
            <img src={event.image.url} alt="" className="size-full object-cover" />
          </div>

          <Button
            asChild
            variant="secondary"
            size="icon"
            className="absolute left-4 top-4 rounded-full shadow-sm"
          >
            <Link to="/" aria-label="Voltar para o início">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-10 lg:gap-y-12">
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
            <div className="flex flex-wrap gap-2">
              {event.categories.map((category) => (
                <Link key={category.id} to="/categoria/$id" params={{ id: String(category.id) }}>
                  <Badge variant="secondary" className="hover:bg-accent">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-tight text-balance sm:text-4xl">
              {event.name}
            </h1>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Quando
                  </dt>
                  <dd className="text-sm">
                    {formatLongDate(event.date)}
                    {event.date_final && <> — até {formatLongDate(event.date_final)}</>}
                  </dd>
                </div>
              </div>

              {event.hour && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Horário
                    </dt>
                    <dd className="text-sm">{formatHour(event.hour)}</dd>
                  </div>
                </div>
              )}

              {event.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Onde
                    </dt>
                    <dd className="text-sm">{event.address}</dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <GoEvent event={event} />
              <FavoriteButton
                eventId={event.id}
                eventName={event.name}
                favorite={event.favorite}
                variant="full"
              />
              <Button type="button" variant="outline" onClick={share}>
                <Share2 className="size-4" />
                Compartilhar
              </Button>
            </div>

            {event.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <li
                    key={tag.name}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Sobre o evento</h2>
              <HtmlText html={event.description} />
            </div>

            {event.flags.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-bold">Links úteis</h2>
                <ul className="space-y-2">
                  {event.flags.map((flag) => (
                    <li key={flag.id}>
                      {flag.link ? (
                        <a
                          href={flag.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="-my-1 inline-flex items-center gap-2 py-1 text-sm font-medium text-primary hover:underline"
                        >
                          {flag.name}
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        <span className="text-sm">{flag.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* No celular vem antes das opiniões: quem está na rua quer saber
              onde é e como chegar, não ler comentário primeiro. */}
          <aside className="order-2 space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
            {hasCoordinates && (
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title={`Mapa de ${event.name}`}
                  src={staticMapUrl(location)}
                  className="h-52 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Button asChild size="sm" variant="outline">
                    <a href={googleMapsUrl(location)} target="_blank" rel="noreferrer">
                      <Navigation className="size-4" />
                      Google Maps
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={wazeUrl(location)} target="_blank" rel="noreferrer">
                      <Navigation className="size-4" />
                      Waze
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {contacts.length > 0 && (
              <div className="rounded-xl border border-border p-4">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Contatos
                </h2>
                <ul className="space-y-2">
                  {contacts.map((contact) => (
                    <li key={`${contact.type}-${contact.value}`}>
                      <a
                        href={contactUrl(contact)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="-my-1 inline-flex items-center gap-2 py-1 text-sm font-medium text-primary hover:underline"
                      >
                        {CONTACT_LABEL[contact.type]}
                        <ExternalLink className="size-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
            <Opinions eventId={event.id} />
          </div>
        </div>
      </article>

      <RelatedEvents event={event} />
    </AppShell>
  );
}

/** Outros eventos das mesmas categorias, para continuar navegando. */
function RelatedEvents({ event }: { event: EventItem }) {
  const { data: events = [] } = useEvents();
  const categoryIds = new Set(event.categories.map((category) => category.id));

  const related = events
    .filter(
      (item) =>
        item.id !== event.id &&
        isUpcoming(item) &&
        item.categories.some((category) => categoryIds.has(category.id)),
    )
    .sort(byDate)
    .slice(0, 4);

  if (!related.length) return null;

  return (
    <Section title="Também rola por aí" description="Nas mesmas categorias">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {related.map((item) => (
          <li key={item.id}>
            <EventCard event={item} className="h-full" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
