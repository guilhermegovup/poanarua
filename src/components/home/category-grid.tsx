import { Link } from "@tanstack/react-router";

import type { Category } from "@/data/types";

/** Grade "Bora curtir POA?" — as categorias do app, agora com nome visível. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            to="/categoria/$id"
            params={{ id: String(category.id) }}
            className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-xl lg:aspect-square"
          >
            {category.url ? (
              <img
                src={category.url}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-blob" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="relative w-full p-3 text-xs font-bold leading-tight text-white sm:text-sm">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="aspect-[4/3] animate-pulse rounded-xl bg-secondary lg:aspect-square"
        />
      ))}
    </div>
  );
}
