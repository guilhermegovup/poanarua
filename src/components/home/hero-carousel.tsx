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
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-card sm:aspect-[16/9] lg:aspect-[21/9]"
            >
              <img
                src={event.image_banner?.url ?? event.image.url}
                alt=""
                className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
              {/* Duas camadas: uma sombra vinda de baixo e um véu de marca, para
                  o texto ficar legível sobre qualquer capa. */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-wine/35 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 lg:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow sm:text-xs">
                  {formatLongDate(event.date)}
                  {event.hour ? ` · ${formatHour(event.hour)}` : ""}
                </p>

                <h2 className="mt-2 max-w-3xl text-balance text-[1.75rem] font-bold leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                  {event.name}
                </h2>

                {event.address && (
                  <p className="mt-3 line-clamp-1 max-w-xl text-sm text-white/80">
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
          <CarouselPrevious className="left-3 hidden border-0 bg-white/90 text-brand-ink shadow-lift hover:bg-white sm:flex" />
          <CarouselNext className="right-3 hidden border-0 bg-white/90 text-brand-ink shadow-lift hover:bg-white sm:flex" />
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
