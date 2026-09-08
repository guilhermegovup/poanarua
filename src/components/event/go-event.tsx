import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Hand } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { isRemote } from "@/data/supabase";
import type { EventItem } from "@/data/types";
import { useAuth } from "@/hooks/use-auth";
import { useIsGoing } from "@/hooks/use-store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "Eu vou" + quem já confirmou, como na tela de evento do app. */
export function GoEvent({ event }: { event: EventItem }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const goingLocal = useIsGoing(event.id);

  const { data: users = [] } = useQuery({
    queryKey: ["go-event", event.id],
    queryFn: () => api.goEventUsers(event.id),
  });

  // Com banco, "eu vou" se descobre pela própria lista de presenças.
  const going = isRemote ? users.some((person) => person.name === user?.name) : goingLocal;

  const label = event.event_date ? "Eu vou" : "Recomendo";

  async function toggle() {
    if (!user) {
      toast("Para marcar presença, entra na tua conta.", {
        description: "É rapidinho, só o e-mail.",
      });
      return;
    }

    try {
      const next = await api.toggleGoEvent(event.id);
      await queryClient.invalidateQueries({ queryKey: ["go-event", event.id] });
      toast(next ? "Bora! Presença confirmada." : "Presença desmarcada.");
    } catch (error) {
      toast((error as Error).message);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        type="button"
        onClick={toggle}
        variant={going ? "default" : "outline"}
        aria-pressed={going}
      >
        <Hand className={cn("size-4", going && "fill-current")} />
        {going ? "Tu vai!" : label}
      </Button>

      {users.length > 0 && (
        <div className="flex items-center gap-2">
          <ul className="flex -space-x-2">
            {users.slice(0, 5).map((person) =>
              person.avatar ? (
                <li key={person.id}>
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="size-8 rounded-full border-2 border-background object-cover"
                  />
                </li>
              ) : (
                <li
                  key={person.id}
                  title={person.name}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {initials(person.name)}
                </li>
              ),
            )}
          </ul>
          <span className="text-sm text-muted-foreground">
            {users.length === 1 ? "1 pessoa vai" : `${users.length} pessoas vão`}
          </span>
        </div>
      )}
    </div>
  );
}
