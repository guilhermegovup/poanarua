import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/data/types";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<EventStatus, string> = {
  pending: "Aguardando revisão",
  published: "Publicado",
  hidden: "Oculto",
  rejected: "Recusado",
};

const STATUS_STYLE: Record<EventStatus, string> = {
  pending: "bg-brand-amber/20 text-foreground hover:bg-brand-amber/20",
  published: "bg-primary text-primary-foreground hover:bg-primary",
  hidden: "bg-secondary text-muted-foreground hover:bg-secondary",
  rejected: "bg-destructive/15 text-destructive hover:bg-destructive/15",
};

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  return (
    <Badge className={cn("shrink-0 font-medium", STATUS_STYLE[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
