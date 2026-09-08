import { Fragment } from "react";

import { parseHtml } from "@/lib/html";
import { cn } from "@/lib/utils";

/**
 * Renderiza a descrição HTML do CMS como elementos React. Nada é injetado no
 * DOM como markup, então conteúdo de terceiros não vira script.
 */
export function HtmlText({ html, className }: { html: string; className?: string }) {
  const blocks = parseHtml(html);

  if (!blocks.length) return null;

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-foreground", className)}>
      {blocks.map((block, blockIndex) => (
        <p key={blockIndex}>
          {block.segments.map((segment, index) => {
            const content = segment.bold ? (
              <strong>{segment.text}</strong>
            ) : segment.italic ? (
              <em>{segment.text}</em>
            ) : (
              segment.text
            );

            if (segment.href) {
              return (
                <a
                  key={index}
                  href={segment.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  {content}
                </a>
              );
            }

            return <Fragment key={index}>{content}</Fragment>;
          })}
        </p>
      ))}
    </div>
  );
}
