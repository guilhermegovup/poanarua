import { useQueryClient } from "@tanstack/react-query";
import { Hand } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import type { EventItem } from "@/data/types";
import { useGoEventCount, useIsGoing, useUser } from "@/hooks/use-store";
import { initials } from "@/lib/format";
import { store } from "@/data/store";
import { cn } from "@/lib/utils";

/** "Eu vou" + quem já confirmou, como na tela de evento do app. */
export function GoEvent({ event }: { event: EventItem }) {
  const going = useIsGoing(event.id);
  const count = useGoEventCount(event.id);
  const user = useUser();
  const queryClient = useQueryClient();

  const users = store.goEventUsers(event.id);
  const label = event.event_date ? "Eu vou" : "Recomendo";

  async function toggle() {
    if (!user) {
      toast("Para marcar presença, entra na tua conta.", {
        description: "É rapidinho, só o e-mail.",
        action: { label: "Entrar", onClick: () => (window.location.href = "/perfil") },
      });
      return;
    }

    const next = await api.toggleGoEvent(event.id);
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast(next ? "Bora! Presença confirmada." : "Presença desmarcada.");
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

      {count > 0 && (
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
            {count === 1 ? "1 pessoa vai" : `${count} pessoas vão`}
          </span>
        </div>
      )}
    </div>
  );
}
