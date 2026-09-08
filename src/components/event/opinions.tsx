import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/data/api";
import { queryKeys, useEvaluations } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          style={{ width: size, height: size }}
          className={cn(
            star <= value ? "fill-brand-amber text-brand-amber" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

export function Opinions({ eventId }: { eventId: number }) {
  const { data: evaluations = [], isLoading } = useEvaluations(eventId);
  const user = useUser();
  const queryClient = useQueryClient();

  const [note, setNote] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const average = evaluations.length
    ? evaluations.reduce((total, item) => total + item.note, 0) / evaluations.length
    : 0;

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!user) {
      toast("Para comentar, entra na tua conta.");
      return;
    }
    if (note === 0) {
      toast("Selecione uma nota!");
      return;
    }

    setSending(true);
    try {
      await api.addEvaluation(eventId, comment.trim(), note);
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations(eventId) });
      setNote(0);
      setComment("");
      toast("Valeu pela opinião!");
    } catch {
      toast("Ocorreu um erro ao enviar comentario.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold">Opiniões</h2>
        {evaluations.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(average)} />
            {average.toFixed(1).replace(".", ",")} · {evaluations.length}{" "}
            {evaluations.length === 1 ? "comentário" : "comentários"}
          </span>
        )}
      </div>

      <form onSubmit={submit} className="mb-6 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tua nota:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNote(star)}
              aria-label={`Dar nota ${star}`}
              aria-pressed={note === star}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6 transition",
                  star <= note
                    ? "fill-brand-amber text-brand-amber"
                    : "text-muted-foreground/40 hover:text-brand-amber",
                )}
              />
            </button>
          ))}
        </div>

        <label htmlFor="opiniao" className="sr-only">
          Teu comentário sobre o evento
        </label>
        <Textarea
          id="opiniao"
          value={comment}
          onChange={(changeEvent) => setComment(changeEvent.target.value)}
          placeholder="Conta pra gente como foi..."
          className="mt-3 min-h-24"
        />

        <Button type="submit" disabled={sending} className="mt-3">
          {sending ? "Enviando..." : "Enviar opinião"}
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : evaluations.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="size-4" />
          Sem comentários no momento
        </p>
      ) : (
        <ul className="space-y-5">
          {evaluations.map((evaluation) => (
            <li key={evaluation.id} className="flex gap-3">
              {evaluation.avatar ? (
                <img
                  src={evaluation.avatar}
                  alt=""
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials(evaluation.name)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{evaluation.name}</span>
                  <Stars value={evaluation.note} size={12} />
                  <span className="text-xs text-muted-foreground">{evaluation.last_comment}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{evaluation.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
