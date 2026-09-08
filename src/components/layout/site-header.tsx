import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useFavoriteCount, useUser } from "@/hooks/use-store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HeaderLink {
  to: "/" | "/busca" | "/favoritos" | "/cadastrar-evento" | "/sobre";
  label: string;
  /** Só a home casa por igualdade; as demais casam por prefixo. */
  exact?: boolean;
}

const LINKS: HeaderLink[] = [
  { to: "/", label: "Início", exact: true },
  { to: "/busca", label: "Buscar" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/cadastrar-evento", label: "Cadastrar evento" },
  { to: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const favorites = useFavoriteCount();
  const user = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center" aria-label="Poa na Rua — início">
          <Brand />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.to : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link to="/busca" aria-label="Buscar eventos">
              <Search className="size-5" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative hidden md:inline-flex">
            <Link to="/favoritos" aria-label={`Favoritos (${favorites})`}>
              <Heart className="size-5" />
              {favorites > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {favorites > 9 ? "9+" : favorites}
                </span>
              )}
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
            <Link to="/perfil" aria-label="Meu perfil">
              {user ? (
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {initials(user.name)}
                </span>
              ) : (
                <span className="text-sm font-medium">Entrar</span>
              )}
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Poa na Rua</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col px-4 pb-6">
                {LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/perfil"
                  className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {user ? "Meu perfil" : "Entrar"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
