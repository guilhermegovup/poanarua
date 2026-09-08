import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { queryKeys } from "@/hooks/use-events";
import { useIsFavorite } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

interface Props {
  eventId: number;
  eventName: string;
  variant?: "icon" | "full";
  className?: string;
}

export function FavoriteButton({ eventId, eventName, variant = "icon", className }: Props) {
  const favorite = useIsFavorite(eventId);
  const queryClient = useQueryClient();

  async function toggle(event: React.MouseEvent) {
    // Os cards são links inteiros: o clique no coração não pode navegar.
    event.preventDefault();
    event.stopPropagation();

    const next = !favorite;
    await api.setFavorite(eventId, next);
    queryClient.invalidateQueries({ queryKey: queryKeys.events });

    toast(next ? "Salvo nos favoritos" : "Removido dos favoritos", {
      description: eventName,
    });
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant={favorite ? "default" : "outline"}
        onClick={toggle}
        className={className}
        aria-pressed={favorite}
      >
        <Heart className={cn("size-4", favorite && "fill-current")} />
        {favorite ? "Favoritado" : "Favoritar"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorite}
      aria-label={favorite ? `Remover ${eventName} dos favoritos` : `Favoritar ${eventName}`}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition hover:bg-background",
        favorite && "text-primary",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", favorite && "fill-current")} />
    </button>
  );
}
