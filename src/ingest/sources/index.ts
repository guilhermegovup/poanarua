import type { Source } from "../types";

import { destinoPoa } from "./destino-poa";

/**
 * Fontes que o coletor visita. Somar uma fonte nova é acrescentar um arquivo
 * em `sources/` e listá-lo aqui — o resto do pipeline não muda.
 */
export const sources: Source[] = [destinoPoa];

export function findSource(id: string): Source | undefined {
  return sources.find((source) => source.id === id);
}

export { destinoPoa };
