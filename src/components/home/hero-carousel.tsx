import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { EventItem } from "@/data/types";
import { formatHour, formatLongDate } from "@/lib/format";

/** Substitui o carrossel de banners "TOP" da home do app. */
export function HeroCarousel({ events }: { events: EventItem[] }) {
  if (!events.length) return null;

  return (
    <Carousel
      opts={{ loop: events.length > 1, align: "start" }}
      plugins={events.length > 1 ? [Autoplay({ delay: 6000, stopOnInteraction: true })] : []}
      className="relative"
    >
      <CarouselContent className="-ml-0">
        {events.map((event) => (
          <CarouselItem key={event.id} className="pl-0">
            <Link
              to="/evento/$id"
              params={{ id: String(event.id) }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[16/9] lg:aspect-[21/9]"
            >
              <img
                src={event.image_banner?.url ?? event.image.url}
                alt=""
                className="size-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-yellow">
                  {formatLongDate(event.date)}
                  {event.hour ? ` · ${formatHour(event.hour)}` : ""}
                </p>
                <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-balance sm:text-3xl lg:text-4xl">
                  {event.name}
                </h2>
                {event.address && (
                  <p className="mt-2 line-clamp-1 max-w-xl text-sm text-white/85">
                    {event.address}
                  </p>
                )}
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {events.length > 1 && (
        <>
          <CarouselPrevious className="left-3 hidden sm:flex" />
          <CarouselNext className="right-3 hidden sm:flex" />
        </>
      )}
    </Carousel>
  );
}

export function HeroSkeleton() {
  return (
    <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-secondary sm:aspect-[16/9] lg:aspect-[21/9]" />
  );
}
