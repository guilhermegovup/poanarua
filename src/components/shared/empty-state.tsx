import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { to: string; label: string };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-6 text-muted-foreground" />
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button asChild className="mt-6">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
