import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { EventForm } from "@/components/admin/event-form";
import { STATUS_LABEL, StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import type { EventStatus } from "@/data/types";
import { queryKeys } from "@/hooks/use-events";

export const Route = createFileRoute("/admin/evento/$id")({
  loader: async ({ params }) => {
    const event = await api.event(Number(params.id));
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.event.name ?? "Evento"} — Admin Poa na Rua` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditEvent,
});

const NEXT_STATUS: EventStatus[] = ["published", "hidden", "rejected"];

function EditEvent() {
  const { event } = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = event.status ?? "published";

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.events });
    await queryClient.invalidateQueries({ queryKey: queryKeys.event(event.id) });
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Editar evento</h1>
            <StatusBadge status={status} />
          </div>

          {event.source && (
            <p className="mt-1 text-sm text-muted-foreground">
              Importado de {event.source.name}
              {event.source.url && (
                <a
                  href={event.source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  ver original
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {status === "published" && (
            <Button asChild variant="outline" size="sm">
              <Link to="/evento/$id" params={{ id: String(event.id) }}>
                Ver no site
              </Link>
            </Button>
          )}
          {NEXT_STATUS.filter((item) => item !== status).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={item === "published" ? "default" : "outline"}
              onClick={async () => {
                await api.setStatus(event.id, item);
                await refresh();
                toast(STATUS_LABEL[item]);
                navigate({ to: "/admin" });
              }}
            >
              {item === "published" ? "Publicar" : STATUS_LABEL[item]}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await api.deleteMany([event.id]);
              await refresh();
              toast("Evento removido");
              navigate({ to: "/admin" });
            }}
          >
            <Trash2 className="size-4 text-destructive" />
            Excluir
          </Button>
        </div>
      </div>

      <EventForm
        event={event}
        submitLabel="Salvar alterações"
        onSubmit={async (values) => {
          await api.updateEvent(event.id, values);
          await refresh();
          toast("Alterações salvas");
          navigate({ to: "/admin" });
        }}
      />
    </AdminShell>
  );
}
