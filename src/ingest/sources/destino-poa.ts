import { absoluteUrl, extractStandard, stripTags } from "../extract";
import type { RawEvent, Source } from "../types";

/**
 * Destino POA — portal de turismo de Porto Alegre.
 *
 * A extração tenta primeiro os padrões abertos (JSON-LD `schema.org/Event` e
 * feed RSS), que é o que a maioria dos portais publica. O seletor de HTML
 * abaixo é o último recurso e é deliberadamente frouxo: pega links de agenda
 * com título e imagem, sem depender de nomes de classe que mudam a cada
 * redesenho.
 *
 * Os seletores de HTML ainda não foram conferidos contra o site no ar — o
 * ambiente onde este código foi escrito não alcança o domínio. Em
 * **Admin → Importar → Buscar eventos agora** dá para ver o que sai antes de
 * mandar qualquer coisa para a fila: a busca só mostra, quem grava é o botão
 * seguinte.
 */

const HOMEPAGE = "https://destinopoa.com.br";

/** Fallback: cartões de agenda em HTML, quando não há JSON-LD nem feed. */
export function extractCards(body: string, pageUrl: string): RawEvent[] {
  const events: RawEvent[] = [];
  const seen = new Set<string>();

  const anchors = body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);

  for (const match of anchors) {
    const href = match[1];
    const inner = match[2] ?? "";
    if (!href) continue;

    // Só links que parecem de evento/agenda/atração.
    if (!/\/(evento|eventos|agenda|atracao|atracoes|o-que-fazer)\//i.test(href)) continue;

    const url = absoluteUrl(href, pageUrl);
    if (!url || seen.has(url)) continue;

    const heading = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(inner)?.[1];
    const title = stripTags(heading ?? inner).slice(0, 160);
    if (title.length < 4) continue;

    seen.add(url);

    const image = /<img[^>]+(?:data-src|src)=["']([^"']+)["']/i.exec(inner)?.[1];
    const dateText = /(\d{1,2}\s*(?:de\s*)?[a-zà-ú]{3,}(?:\s*(?:de\s*)?\d{4})?)/i.exec(
      stripTags(inner),
    )?.[1];

    const event: RawEvent = { name: title, url };

    const resolvedImage = absoluteUrl(image, pageUrl);
    if (resolvedImage) event.imageUrl = resolvedImage;
    if (dateText) event.startDate = dateText;

    events.push(event);
  }

  return events;
}

export const destinoPoa: Source = {
  id: "destino-poa",
  name: "Destino POA",
  homepage: HOMEPAGE,
  entrypoints: [
    `${HOMEPAGE}/eventos/`,
    `${HOMEPAGE}/agenda/`,
    `${HOMEPAGE}/o-que-fazer/`,
    `${HOMEPAGE}/feed/`,
  ],
  extract(body, url) {
    const standard = extractStandard(body, url);
    if (standard.length) return standard;
    return extractCards(body, url);
  },
};
