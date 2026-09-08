import type { EventItem, EventSource } from "@/data/types";

/**
 * Um evento como o coletor o encontra na fonte: campos crus, ainda sem
 * categoria, sem tags e sem id. A normalização vira `EventItem`.
 */
export interface RawEvent {
  name: string;
  /** Texto ou HTML, como veio da fonte. */
  description?: string;
  /** ISO ou o que a fonte devolveu; a normalização resolve. */
  startDate?: string;
  endDate?: string;
  /** Endereço em texto livre. */
  address?: string;
  locality?: string;
  latitude?: string;
  longitude?: string;
  imageUrl?: string;
  /** Página do evento na fonte. */
  url?: string;
  /** Id no sistema de origem, quando a fonte expõe. */
  externalId?: string;
  /** Palavras-chave da fonte, usadas como pista de categoria. */
  keywords?: string[];
  /** Preço em texto ("Gratuito", "R$ 20"), usado para inferir a tag GRATUITO. */
  offers?: string;
  organizer?: string;
}

/** Uma fonte de eventos: sabe listar as páginas e extrair eventos delas. */
export interface Source {
  id: string;
  name: string;
  /** Site da fonte, usado no crédito. */
  homepage: string;
  /**
   * Páginas a visitar. Podem ser listagens HTML, feeds RSS ou endpoints JSON —
   * o extrator decide o que fazer com o conteúdo.
   */
  entrypoints: string[];
  /**
   * Extrai eventos crus do conteúdo de uma página. Recebe o corpo já baixado
   * para o coletor continuar testável sem rede.
   */
  extract: (body: string, url: string) => RawEvent[];
}

export interface IngestResult {
  source: EventSource;
  /** Eventos prontos para revisão no webadmin. */
  events: EventItem[];
  /** Quantos foram descartados por já existirem. */
  duplicates: number;
  /** Motivos de descarte, para diagnosticar uma fonte que parou de funcionar. */
  skipped: { reason: string; name?: string; url?: string }[];
}
