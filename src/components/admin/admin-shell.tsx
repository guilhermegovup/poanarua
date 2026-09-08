import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, CalendarPlus, DownloadCloud, LayoutList, ShieldAlert } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { isRemote } from "@/data/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isAdmUnlocked, lockAdm } from "@/lib/admin-gate";
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

/**
 * Casca do webadmin.
 *
 * A porta de verdade são as policies do banco: sem estar na tabela `admins`,
 * nenhuma escrita passa e a leitura só devolve evento publicado. Esta barreira
 * é de interface — evita que alguém sem permissão veja uma tela quebrada.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = isAdmUnlocked();
    setUnlocked(ok);
    if (!ok) navigate({ to: "/adm", replace: true });
  }, [navigate]);

  if (unlocked !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <div className="h-8 w-40 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (isRemote && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <div className="h-8 w-40 animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (isRemote && !isAdmin) {
    return <AccessDenied />;
  }

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

          <button
            type="button"
            onClick={() => {
              lockAdm();
              navigate({ to: "/adm", replace: true });
            }}
            className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

function AccessDenied() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="max-w-md rounded-xl border border-border bg-background p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Área restrita</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? "Tua conta não tem permissão de administrador."
            : "Entra com uma conta de administrador para continuar."}
        </p>
        <Button asChild className="mt-6">
          <Link to={user ? "/" : "/perfil"}>{user ? "Voltar ao site" : "Entrar"}</Link>
        </Button>
      </div>
    </div>
  );
}
