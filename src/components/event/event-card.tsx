import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";

import { FavoriteButton } from "@/components/event/favorite-button";
import { Badge } from "@/components/ui/badge";
import type { EventItem } from "@/data/types";
import { formatHour, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  event: EventItem;
  className?: string;
}

export function EventCard({ event, className }: Props) {
  return (
    <article className={cn("group relative", className)}>
      <Link
        to="/evento/$id"
        params={{ id: String(event.id) }}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={event.image.url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-0 top-3 rounded-r-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {formatShortDate(event.date)}
          </span>
          {event.featured && (
            <Badge className="absolute right-3 top-3 bg-brand-orange text-white hover:bg-brand-orange">
              Destaque
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-bold leading-snug">{event.name}</h3>

          <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
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
        </div>
      </Link>

      <FavoriteButton
        eventId={event.id}
        eventName={event.name}
        className="absolute right-2 top-2 z-10 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      />
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="aspect-[4/3] animate-pulse bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
