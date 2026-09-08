import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdmUnlocked, tryUnlockAdm } from "@/lib/admin-gate";

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

function AdmGate() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAdmUnlocked()) navigate({ to: "/admin", replace: true });
  }, [navigate]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (tryUnlockAdm(value.trim())) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    setError(true);
    setValue("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-border bg-background p-8 text-center"
      >
        <Brand iconOnly />
        <Lock className="mx-auto mt-4 size-8 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Área restrita</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informe a senha de acesso.</p>

        <Input
          type="password"
          autoFocus
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(false);
          }}
          placeholder="Senha"
          aria-label="Senha de acesso"
          aria-invalid={error}
          className="mt-6"
        />

        {error && <p className="mt-2 text-sm text-destructive">Senha incorreta.</p>}

        <Button type="submit" className="mt-4 w-full" disabled={!value.trim()}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
