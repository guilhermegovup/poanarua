import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  src: string | undefined;
  /** Fica no `alt` só quando não há foto; a decorativa vai com alt vazio. */
  name?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Foto do evento, ou um lugar vazio assumido.
 *
 * Antes, evento sem foto ganhava uma imagem aleatória de banco de imagens. Uma
 * montanha nevada em cima de "Copa do Mundo" não parece foto faltando — parece
 * foto errada, e ninguém vai atrás de corrigir o que aparenta estar pronto.
 * Um espaço da marca dizendo que falta foto é honesto e pede a correção.
 */
export function EventImage({ src, name, className, sizes, priority }: Props) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={name ? `${name} — sem foto` : "Evento sem foto"}
        className={cn(
          "relative flex items-center justify-center bg-brand-tint text-brand-wine/35",
          className,
        )}
      >
        <div className="absolute inset-0 bg-brand-blob opacity-25" aria-hidden />
        <ImageOff className="relative size-1/4 max-h-10 min-h-5 min-w-5 max-w-10" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      {...(sizes ? { sizes } : {})}
      className={cn("object-cover", className)}
    />
  );
}
