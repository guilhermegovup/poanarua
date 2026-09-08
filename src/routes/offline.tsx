import { createFileRoute, Link } from "@tanstack/react-router";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [{ title: "Sem conexão — Poa na Rua" }, { name: "robots", content: "noindex" }],
  }),
  component: Offline,
});

/** Página que o service worker serve quando a navegação falha sem rede. */
function Offline() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <img src="/logo-poa-na-rua.svg" alt="" className="size-24" width={96} height={96} />

      <WifiOff className="mt-8 size-8 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-bold">Tu tá sem conexão</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        A rua continua aí. Assim que a internet voltar, a programação carrega de novo.
      </p>

      <Button asChild className="mt-6">
        <Link to="/">Tentar de novo</Link>
      </Button>
    </main>
  );
}
