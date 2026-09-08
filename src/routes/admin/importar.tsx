import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, DownloadCloud, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { isRemote } from "@/data/supabase";
import type { EventItem } from "@/data/types";
import { queryKeys } from "@/hooks/use-events";
import { collectEvents } from "@/ingest/server";
import { sources } from "@/ingest/sources";
import type { IngestResult } from "@/ingest/types";
import { formatShortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/importar")({
  head: () => ({
    meta: [
      { title: "Importar eventos — Admin Poa na Rua" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<IngestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResults(null);

    try {
      const knownKeys = await api.knownDedupeKeys();
      const collected = await collectEvents({
        data: { knownKeys: [...knownKeys] },
      });
      setResults(collected);

      const total = collected.reduce((sum, result) => sum + result.events.length, 0);
      if (!total) toast("Nenhum evento novo encontrado.");
    } catch (runError) {
      setError((runError as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function importAll(events: EventItem[]) {
    const imported = await api.importEvents(events);
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events });
    toast(`${imported} ${imported === 1 ? "evento" : "eventos"} na fila de revisão`);
    navigate({ to: "/admin" });
  }

  const found = results?.flatMap((result) => result.events) ?? [];

  return (
    <AdminShell>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Importar eventos</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        O coletor visita as fontes cadastradas, extrai o que encontra e traz para a fila de revisão.{" "}
        <strong>Nada é publicado automaticamente</strong> — tu decide o que entra no site.
      </p>

      <div className="rounded-lg border border-border bg-background p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Fontes</h2>
        <ul className="mt-3 space-y-2">
          {sources.map((source) => (
            <li key={source.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{source.name}</span>
              <a
                href={source.homepage}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {source.homepage.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-3" />
              </a>
              <span className="ml-auto text-xs text-muted-foreground">
                {source.entrypoints.length} páginas
              </span>
            </li>
          ))}
        </ul>

        <Button onClick={run} disabled={running || !isRemote} className="mt-4">
          <DownloadCloud className="size-4" />
          {running ? "Buscando..." : "Buscar eventos agora"}
        </Button>

        {!isRemote && (
          <p className="mt-3 text-xs text-muted-foreground">
            A importação precisa do banco ligado: o coletor roda no servidor e só aceita
            administrador autenticado.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-medium">A coleta falhou.</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            <p className="mt-2 text-muted-foreground">
              A fonte pode ter mudado de endereço ou saído do ar. Veja <code>docs/COLETOR.md</code>{" "}
              para ajustar os pontos de entrada.
            </p>
          </div>
        </div>
      )}

      {results && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {found.length} {found.length === 1 ? "evento novo" : "eventos novos"}
            </h2>
            {found.length > 0 && (
              <Button onClick={() => importAll(found)}>Mandar tudo para revisão</Button>
            )}
          </div>

          {results.map((result) => (
            <section key={result.source.id} className="mb-6">
              <h3 className="text-sm font-bold">{result.source.name}</h3>
              <p className="text-xs text-muted-foreground">
                {result.events.length} novos · {result.duplicates} já conhecidos ·{" "}
                {result.skipped.length} descartados
              </p>

              {result.skipped.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.skipped.slice(0, 5).map((item, index) => (
                    <li key={index}>
                      {item.reason}
                      {item.url ? ` — ${item.url}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mt-3 space-y-2">
                {result.events.map((event) => (
                  <li
                    key={event.dedupe_key ?? event.id}
                    className="flex gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <img
                      src={event.image.url}
                      alt=""
                      loading="lazy"
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(event.date)}
                        {event.address ? ` · ${event.address}` : ""}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {event.categories.map((category) => (
                          <span key={category.id} className="rounded bg-secondary px-1.5 py-0.5">
                            {category.name}
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
