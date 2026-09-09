import type { EventItem, EventSource } from "@/data/types";

import { normalizeEvent } from "./normalize";
import { findSource, sources } from "./sources";
import type { IngestResult, RawEvent, Source } from "./types";

/**
 * Orquestra a coleta: baixa as páginas de cada fonte, extrai, normaliza e
 * descarta o que já existe.
 *
 * O `fetch` entra por parâmetro para o pipeline ser testável sem rede e para
 * rodar tanto numa edge function quanto num script local.
 */

export interface RunOptions {
  /** Fontes a visitar; padrão é todas. */
  sourceIds?: string[];
  /** Chaves de dedupe já existentes na base. */
  knownKeys?: Set<string>;
  fetchPage?: (url: string) => Promise<string>;
  today?: Date;
  /** Máximo de eventos por fonte, para uma fonte quebrada não inundar a fila. */
  limit?: number;
}

const defaultFetch = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      // Identificar o robô é o mínimo de educação com quem hospeda a fonte.
      "User-Agent": "PoaNaRuaBot/1.0 (+https://poanarua.com.br)",
      Accept: "text/html,application/xhtml+xml,application/xml,application/rss+xml",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`);
  }

  return response.text();
};

export async function runSource(source: Source, options: RunOptions = {}): Promise<IngestResult> {
  const {
    knownKeys = new Set<string>(),
    fetchPage = defaultFetch,
    today = new Date(),
    limit = 60,
  } = options;

  const sourceInfo: EventSource = {
    id: source.id,
    name: source.name,
    url: source.homepage,
  };

  const result: IngestResult = {
    source: sourceInfo,
    events: [],
    duplicates: 0,
    skipped: [],
  };

  // Dedupe dentro da própria rodada: a mesma agenda costuma repetir o evento
  // na listagem e no feed.
  const seen = new Set(knownKeys);

  const collect = (raws: RawEvent[]) => {
    for (const raw of raws) {
      if (result.events.length >= limit) break;

      const event = normalizeEvent(raw, sourceInfo, today);
      if (!event) {
        result.skipped.push({
          reason: "sem nome utilizável",
          ...(raw.url ? { url: raw.url } : {}),
        });
        continue;
      }

      if (seen.has(event.dedupe_key!)) {
        result.duplicates += 1;
        continue;
      }

      seen.add(event.dedupe_key!);
      result.events.push(event);
    }
  };

  // Fonte geradora não tem página para baixar: a regra é a própria fonte.
  if (source.generate) {
    collect(source.generate(today));
    return result;
  }

  for (const entrypoint of source.entrypoints) {
    let body: string;
    try {
      body = await fetchPage(entrypoint);
    } catch (error) {
      result.skipped.push({
        reason: `falha ao baixar: ${(error as Error).message}`,
        url: entrypoint,
      });
      continue;
    }

    let raws;
    try {
      raws = source.extract(body, entrypoint);
    } catch (error) {
      result.skipped.push({
        reason: `falha ao extrair: ${(error as Error).message}`,
        url: entrypoint,
      });
      continue;
    }

    collect(raws);
  }

  return result;
}

export async function runAll(options: RunOptions = {}): Promise<IngestResult[]> {
  const selected = options.sourceIds?.length
    ? options.sourceIds.map(findSource).filter((source): source is Source => Boolean(source))
    : sources;

  const results: IngestResult[] = [];
  for (const source of selected) {
    results.push(await runSource(source, options));
  }
  return results;
}

/** Junta os resultados numa lista só, pronta para a fila de revisão. */
export function flatten(results: IngestResult[]): EventItem[] {
  return results.flatMap((result) => result.events);
}
