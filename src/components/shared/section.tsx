import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  action?: { to: string; label: string };
  className?: string;
  children: ReactNode;
}

export function Section({ title, description, action, className, children }: Props) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-4 pb-8 pt-12", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-balance text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">
            {title}
          </h2>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        </div>

        {action && (
          <Link
            to={action.to}
            className="-my-2 hidden shrink-0 items-center gap-1 py-2 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            {action.label}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}
