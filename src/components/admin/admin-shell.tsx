import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, CalendarPlus, DownloadCloud, LayoutList, ShieldAlert } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { signOut } from "@/data/auth";
import { isRemote } from "@/data/supabase";
import { useAuth } from "@/hooks/use-auth";
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
  const { session, isAdmin, loading, refresh } = useAuth();
  const navigate = useNavigate();

  // Sem sessão nenhuma, manda para a entrada em vez de mostrar "sem permissão":
  // quem chegou aqui direto pela URL só precisa entrar.
  useEffect(() => {
    if (isRemote && !loading && !session) navigate({ to: "/adm", replace: true });
  }, [loading, navigate, session]);

  if (isRemote && (loading || !session)) {
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
        {/*
          No celular a barra quebra em duas linhas: com logo, duas abas e duas
          ações numa linha só, "Importar" sobrava numa tira de 30px rolável.
        */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-4 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
          <Link to="/admin" className="flex items-center gap-2 py-1">
            <Brand iconOnly />
            <span className="text-sm font-bold">Admin</span>
          </Link>

          <nav className="order-last flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:ml-4 sm:w-auto">
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
            className="ml-auto flex shrink-0 items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver o site
            <ArrowUpRight className="size-4" />
          </Link>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              await refresh();
              navigate({ to: "/adm", replace: true });
            }}
            className="-my-2 shrink-0 py-2 text-sm text-muted-foreground hover:text-foreground"
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
