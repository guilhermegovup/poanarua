import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { EventImage } from "@/components/event/event-image";
import { FavoriteButton } from "@/components/event/favorite-button";
import type { EventItem } from "@/data/types";
import { formatHour, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Item de lista horizontal, usado em busca, favoritos e categorias. */
export function EventRow({ event }: { event: EventItem }) {
  return (
    <article className="relative">
      <Link
        to="/evento/$id"
        params={{ id: String(event.id) }}
        className="flex gap-4 rounded-xl border border-border bg-card p-3 shadow-card transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/30 hover:shadow-lift"
      >
        <EventImage
          src={event.image.url}
          name={event.name}
          className="size-24 shrink-0 rounded-lg sm:size-28"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-10">
          <h3 className="line-clamp-2 font-bold leading-snug">{event.name}</h3>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatShortDate(event.date)}
            {event.hour && (
              <>
                <Clock className="ml-2 size-3.5 shrink-0" />
                {formatHour(event.hour)}
              </>
            )}
          </p>

          {event.address && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{event.address}</span>
            </p>
          )}

          {event.tags.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag.name}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    // Gratuito é a informação que mais muda a decisão de ir.
                    tag.name === "GRATUITO"
                      ? "bg-brand-tint-strong text-brand-wine"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>

      <FavoriteButton
        eventId={event.id}
        eventName={event.name}
        favorite={event.favorite}
        className="absolute right-2 top-2 z-10 shadow-card"
      />
    </article>
  );
}

export function EventRowSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border p-3">
      <div className="size-24 shrink-0 animate-pulse rounded-lg bg-secondary sm:size-28" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
