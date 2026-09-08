import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import { isRemote } from "@/data/supabase";
import { queryKeys } from "@/hooks/use-events";
import { useIsFavorite } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

interface Props {
  eventId: number;
  eventName: string;
  /** Vem da listagem quando o banco está ligado. */
  favorite?: boolean | undefined;
  variant?: "icon" | "full";
  className?: string;
}

export function FavoriteButton({
  eventId,
  eventName,
  favorite: initial,
  variant = "icon",
  className,
}: Props) {
  // Sem banco, o store local é a fonte; com banco, o valor vem no evento.
  const local = useIsFavorite(eventId);
  const [remoteFavorite, setRemoteFavorite] = useState(Boolean(initial));
  const favorite = isRemote ? remoteFavorite : local;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isRemote) setRemoteFavorite(Boolean(initial));
  }, [initial]);

  async function toggle(event: React.MouseEvent) {
    // Os cards são links inteiros: o clique no coração não pode navegar.
    event.preventDefault();
    event.stopPropagation();

    const next = !favorite;
    if (isRemote) setRemoteFavorite(next);

    try {
      await api.setFavorite(eventId, next);
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      toast(next ? "Salvo nos favoritos" : "Removido dos favoritos", {
        description: eventName,
      });
    } catch (error) {
      if (isRemote) setRemoteFavorite(!next);
      toast((error as Error).message);
    }
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
