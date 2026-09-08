import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarPlus, DownloadCloud, LayoutList, ArrowUpRight } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { cn } from "@/lib/utils";

const LINKS: {
  to: "/admin" | "/admin/importar" | "/admin/evento/novo";
  label: string;
  icon: typeof LayoutList;
  exact?: boolean;
}[] = [
  { to: "/admin", label: "Eventos", icon: LayoutList, exact: true },
  { to: "/admin/importar", label: "Importar", icon: DownloadCloud },
  { to: "/admin/evento/novo", label: "Novo evento", icon: CalendarPlus },
];

/** Casca do webadmin: navegação própria, sem as tabs do site público. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <Brand iconOnly />
            <span className="text-sm font-bold">Admin</span>
          </Link>

          <nav className="ml-4 flex items-center gap-1 overflow-x-auto">
            {LINKS.map((link) => {
              const active = link.exact ? pathname === link.to : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/"
            className="ml-auto flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver o site
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
