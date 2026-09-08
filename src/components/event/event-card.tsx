import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";

import { FavoriteButton } from "@/components/event/favorite-button";
import type { EventItem } from "@/data/types";
import { formatHour, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  event: EventItem;
  className?: string;
}

/** Só as tags que mudam a decisão de ir; o resto é ruído no card. */
const DECISION_TAGS = ["GRATUITO", "PARA CRIANÇAS", "PET FRIENDLY"];

export function EventCard({ event, className }: Props) {
  const decisive = event.tags.filter((tag) => DECISION_TAGS.includes(tag.name)).slice(0, 2);

  return (
    <article className={cn("group relative", className)}>
      <Link
        to="/evento/$id"
        params={{ id: String(event.id) }}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={event.image.url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />

          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary-foreground shadow-card">
            {formatShortDate(event.date)}
          </span>

          {event.featured && (
            <span className="absolute right-3 top-3 rounded-md bg-brand-orange px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-white shadow-card">
              Destaque
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-bold leading-snug">{event.name}</h3>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {event.hour && (
              <p className="flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" />
                {formatHour(event.hour)}
              </p>
            )}
            {event.address && (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="line-clamp-1">{event.address}</span>
              </p>
            )}
          </div>

          {decisive.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {decisive.map((tag) => (
                <li
                  key={tag.name}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
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
        className="absolute right-2 top-2 z-10 shadow-card sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      />
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
