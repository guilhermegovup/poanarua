import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EventImage } from "@/components/event/event-image";
import { AdminShell } from "@/components/admin/admin-shell";
import { STATUS_LABEL, StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { api } from "@/data/api";
import type { EventItem, EventStatus } from "@/data/types";
import { queryKeys } from "@/hooks/use-events";
import { byDate, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Eventos — Admin Poa na Rua" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminEvents,
});

const FILTERS: { value: EventStatus | "all"; label: string }[] = [
  { value: "pending", label: "Aguardando revisão" },
  { value: "published", label: "Publicados" },
  { value: "hidden", label: "Ocultos" },
  { value: "rejected", label: "Recusados" },
  { value: "all", label: "Todos" },
];

function AdminEvents() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: api.adminEvents,
  });

  const [filter, setFilter] = useState<EventStatus | "all">("pending");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: events.length };
    for (const event of events) {
      const status = event.status ?? "published";
      base[status] = (base[status] ?? 0) + 1;
    }
    return base;
  }, [events]);

  const visible = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return events
      .filter((event) => filter === "all" || (event.status ?? "published") === filter)
      .filter(
        (event) =>
          !needle ||
          `${event.name} ${event.address} ${event.source?.name ?? ""}`
            .toLowerCase()
            .includes(needle),
      )
      .sort(byDate);
  }, [events, filter, term]);

  const allSelected = visible.length > 0 && selected.length === visible.length;

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events });
    setSelected([]);
  }

  async function apply(status: EventStatus, ids = selected) {
    if (!ids.length) return;
    await api.setStatusMany(ids, status);
    await refresh();
    toast(
      `${ids.length} ${ids.length === 1 ? "evento" : "eventos"}: ${STATUS_LABEL[status].toLowerCase()}`,
    );
  }

  async function remove(ids = selected) {
    if (!ids.length) return;
    await api.deleteMany(ids);
    await refresh();
    toast(`${ids.length} ${ids.length === 1 ? "evento removido" : "eventos removidos"}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts["pending"] ?? 0} aguardando revisão · {counts["published"] ?? 0} no ar
          </p>
        </div>

        <Button asChild>
          <Link to="/admin/evento/novo">
            <CalendarPlus className="size-4" />
            Novo evento
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value);
              setSelected([]);
            }}
            aria-pressed={filter === item.value}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition",
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {item.label}
            <span className="ml-1.5 opacity-70">{counts[item.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Filtrar por nome, endereço ou fonte..."
        className="mt-4"
        type="search"
      />

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-accent p-3">
          <span className="text-sm font-medium">
            {selected.length} selecionado{selected.length > 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" onClick={() => apply("published")}>
              <Eye className="size-4" />
              Publicar
            </Button>
            <Button size="sm" variant="outline" onClick={() => apply("hidden")}>
              <EyeOff className="size-4" />
              Ocultar
            </Button>
            <Button size="sm" variant="outline" onClick={() => apply("rejected")}>
              Recusar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove()}>
              <Trash2 className="size-4 text-destructive" />
              Excluir
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Nada por aqui."
            description={
              filter === "pending"
                ? "Nenhum evento aguardando revisão. Roda uma importação para trazer novidades."
                : "Nenhum evento neste filtro."
            }
            action={{ to: "/admin/importar", label: "Importar eventos" }}
          />
        ) : (
          <>
            <label className="mb-2 flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) =>
                  setSelected(checked ? visible.map((event) => event.id) : [])
                }
              />
              Selecionar todos ({visible.length})
            </label>

            <ul className="space-y-2">
              {visible.map((event) => (
                <li key={event.id}>
                  <AdminRow
                    event={event}
                    checked={selected.includes(event.id)}
                    onToggle={(checked) =>
                      setSelected((current) =>
                        checked ? [...current, event.id] : current.filter((id) => id !== event.id),
                      )
                    }
                    onStatus={(status) => apply(status, [event.id])}
                    onDelete={() => remove([event.id])}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function AdminRow({
  event,
  checked,
  onToggle,
  onStatus,
  onDelete,
}: {
  event: EventItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onStatus: (status: EventStatus) => void;
  onDelete: () => void;
}) {
  const status = event.status ?? "published";

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onToggle(value === true)}
        aria-label={`Selecionar ${event.name}`}
        className="mt-1"
      />

      <EventImage src={event.image.url} name={event.name} className="size-16 shrink-0 rounded-md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="line-clamp-1 font-medium">{event.name}</h2>
          <StatusBadge status={status} />
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatShortDate(event.date)}
          {event.address ? ` · ${event.address}` : ""}
        </p>

        {event.source && (
          <p className="mt-1 text-xs text-muted-foreground">
            via {event.source.name}
            {event.source.url && (
              <a
                href={event.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                original
                <ExternalLink className="size-3" />
              </a>
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
        {status !== "published" && (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Publicar"
            onClick={() => onStatus("published")}
          >
            <Eye className="size-4" />
          </Button>
        )}
        {status === "published" && (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Ocultar"
            onClick={() => onStatus("hidden")}
          >
            <EyeOff className="size-4" />
          </Button>
        )}
        <Button asChild size="icon" variant="ghost" aria-label="Editar">
          <Link to="/admin/evento/$id" params={{ id: String(event.id) }}>
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button size="icon" variant="ghost" aria-label="Excluir" onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
