import { Link } from "@tanstack/react-router";

import type { Category } from "@/data/types";

/**
 * Categoria é navegação secundária: no lugar de uma grade de nove blocos
 * comendo meia home, uma faixa que rola e sai do caminho.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <ul className="no-scrollbar fade-edge -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:snap-none sm:px-0">
      {categories.map((category) => (
        <li key={category.id} className="shrink-0 snap-start">
          <Link
            to="/categoria/$id"
            params={{ id: String(category.id) }}
            className="group relative flex h-28 w-40 items-end overflow-hidden rounded-xl sm:h-32 sm:w-48"
          >
            {category.url ? (
              <img
                src={category.url}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-blob" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/25 to-transparent" />
            <span className="relative w-full p-3 text-xs font-bold leading-tight text-white">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CategoryRailSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-28 w-40 shrink-0 animate-pulse rounded-xl bg-secondary sm:h-32 sm:w-48"
        />
      ))}
    </div>
  );
}
