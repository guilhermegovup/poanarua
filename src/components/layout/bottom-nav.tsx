import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarPlus, Heart, Home, Search, User, type LucideIcon } from "lucide-react";

import { useFavoriteCount } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

interface NavItem {
  to: "/" | "/busca" | "/cadastrar-evento" | "/favoritos" | "/perfil";
  label: string;
  icon: LucideIcon;
  /** Só a home casa por igualdade; as demais casam por prefixo. */
  exact?: boolean;
  /** Mostra a contagem de favoritos sobre o ícone. */
  badge?: boolean;
}

const ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/busca", label: "Buscar", icon: Search },
  { to: "/cadastrar-evento", label: "Cadastrar", icon: CalendarPlus },
  { to: "/favoritos", label: "Favoritos", icon: Heart, badge: true },
  { to: "/perfil", label: "Perfil", icon: User },
];

/**
 * Barra inferior no celular, espelhando as tabs do app nativo. No desktop o
 * cabeçalho já cobre a navegação, então ela some.
 */
export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const favorites = useFavoriteCount();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/92 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // 56px de altura: alvo confortável de polegar com rótulo
                  "relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  "transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground",
                )}
              >
                {/* Traço curto no topo marca a aba ativa sem depender só de cor. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity duration-200",
                    active ? "bg-primary opacity-100" : "opacity-0",
                  )}
                />
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                  {item.badge && favorites > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                      {favorites > 9 ? "9+" : favorites}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
