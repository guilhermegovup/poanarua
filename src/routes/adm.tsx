import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/data/auth";
import { ADMIN_EMAIL } from "@/data/config";
import { isRemote } from "@/data/supabase";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/adm")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área restrita — Poa na Rua" },
      { name: "description", content: "Acesso restrito à administração do Poa na Rua." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Área restrita — Poa na Rua" },
      { property: "og:description", content: "Acesso restrito à administração do Poa na Rua." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdmGate,
});

/**
 * Entrada da administração.
 *
 * Pede só a senha, mas quem confere é o Supabase Auth — o e-mail da conta vem
 * da configuração e a senha nunca chega ao código. Entrar aqui cria uma sessão
 * de verdade, que é o que faz as policies do banco valerem: sem estar na tabela
 * `admins`, nenhuma escrita passa nem que se descubra este endereço.
 */
function AdmGate() {
  const navigate = useNavigate();
  const { isAdmin, loading, refresh } = useAuth();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin", replace: true });
  }, [isAdmin, loading, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setBusy(true);
    setError(null);

    // Sem banco não existe autenticação nem dado a proteger; é o modo de
    // desenvolvimento, e travar aqui só impediria de ver as telas.
    if (!isRemote) {
      navigate({ to: "/admin", replace: true });
      setBusy(false);
      return;
    }

    try {
      const session = await signIn(ADMIN_EMAIL, password);

      if (!session.isAdmin) {
        setError("Essa conta não tem permissão de administrador.");
        return;
      }

      await refresh();
      navigate({ to: "/admin", replace: true });
    } catch {
      // A mensagem é a mesma para senha errada e conta inexistente: dizer qual
      // dos dois falhou ajudaria quem está tentando adivinhar.
      setError("Senha incorreta.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-border bg-background p-8 text-center shadow-card"
      >
        <Brand iconOnly />
        <Lock className="mx-auto mt-4 size-8 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Área restrita</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informe a senha de acesso.</p>

        <label htmlFor="senha" className="sr-only">
          Senha de acesso
        </label>
        <Input
          id="senha"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
          placeholder="Senha"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "senha-erro" : undefined}
          className="mt-6 h-11"
        />

        {error && (
          <p id="senha-erro" role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-4 h-11 w-full" disabled={!password || busy}>
          {busy ? "Entrando..." : "Entrar"}
        </Button>

        {!isRemote && (
          <p className="mt-4 text-xs text-muted-foreground">
            O banco não está ligado nesta sessão, então não há o que autenticar.
          </p>
        )}
      </form>
    </div>
  );
}
