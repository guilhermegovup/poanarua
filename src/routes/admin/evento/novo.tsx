import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { EventForm } from "@/components/admin/event-form";
import { api } from "@/data/api";
import { queryKeys } from "@/hooks/use-events";

export const Route = createFileRoute("/admin/evento/novo")({
  head: () => ({
    meta: [{ title: "Novo evento — Admin Poa na Rua" }, { name: "robots", content: "noindex" }],
  }),
  component: NewEvent,
});

function NewEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <AdminShell>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Novo evento</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Cadastrado aqui já entra publicado no site.
      </p>

      <EventForm
        submitLabel="Publicar evento"
        onSubmit={async (values) => {
          const created = await api.createEvent(values);
          await api.setStatus(created.id, "published");
          await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
          await queryClient.invalidateQueries({ queryKey: queryKeys.events });
          toast("Evento publicado!");
          navigate({ to: "/admin" });
        }}
      />
    </AdminShell>
  );
}
