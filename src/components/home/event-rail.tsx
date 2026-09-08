import { EventCard, EventCardSkeleton } from "@/components/event/event-card";
import type { EventItem } from "@/data/types";

/**
 * Carrossel horizontal no celular, grade no desktop — o mesmo conteúdo da
 * faixa "Hoje Tem :)" do app.
 */
export function EventRail({ events }: { events: EventItem[] }) {
  return (
    <>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:hidden">
        {events.map((event) => (
          <li key={event.id} className="w-[70vw] max-w-[280px] shrink-0 snap-start">
            <EventCard event={event} className="h-full" />
          </li>
        ))}
      </ul>

      <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} className="h-full" />
          </li>
        ))}
      </ul>
    </>
  );
}

export function EventRailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
