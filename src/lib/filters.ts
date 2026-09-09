import type { EventItem } from "@/data/types";

import { isHappeningToday, toDate } from "./format";

/**
 * Quem abre o Poa na Rua não pensa em categoria; pensa em "o que eu faço
 * hoje". Estes são os recortes que respondem a essa pergunta.
 */
export type QuickFilterId = "hoje" | "amanha" | "fim-de-semana" | "gratis" | "criancas";

export interface QuickFilter {
  id: QuickFilterId;
  label: string;
  /** Rótulo curto, para caber na faixa do celular. */
  short: string;
  match: (event: EventItem, today: Date) => boolean;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Um evento com período cobre todos os dias entre início e fim. */
function coversDay(event: EventItem, day: Date): boolean {
  const start = toDate(event.date);
  if (!start) return false;

  const end = toDate(event.date_final);
  if (!end) return sameDay(start, day);

  const from = new Date(start).setHours(0, 0, 0, 0);
  const to = new Date(end).setHours(23, 59, 59, 999);
  const target = new Date(day).setHours(12, 0, 0, 0);
  return target >= from && target <= to;
}

function hasTag(event: EventItem, name: string): boolean {
  return event.tags.some((tag) => tag.name === name);
}

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "hoje",
    label: "Hoje",
    short: "Hoje",
    match: (event, today) => isHappeningToday(event, today),
  },
  {
    id: "amanha",
    label: "Amanhã",
    short: "Amanhã",
    match: (event, today) => {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return coversDay(event, tomorrow);
    },
  },
  {
    id: "fim-de-semana",
    label: "Fim de semana",
    short: "Fim de semana",
    match: (event, today) => {
      // Sábado e domingo da semana corrente; na sexta já vale o dia seguinte.
      for (let offset = 0; offset <= 7; offset += 1) {
        const day = new Date(today);
        day.setDate(day.getDate() + offset);
        const weekday = day.getDay();
        if (weekday !== 0 && weekday !== 6) continue;
        if (coversDay(event, day)) return true;
        // Só olhamos o primeiro fim de semana à frente.
        if (weekday === 0 && offset > 0) break;
      }
      return false;
    },
  },
  {
    id: "gratis",
    label: "De graça",
    short: "De graça",
    match: (event) => hasTag(event, "GRATUITO"),
  },
  {
    id: "criancas",
    label: "Com criança",
    short: "Com criança",
    match: (event) =>
      hasTag(event, "PARA CRIANÇAS") ||
      event.categories.some((category) => category.name === "PARA CRIANÇAS"),
  },
];

export function findQuickFilter(id: QuickFilterId | null): QuickFilter | undefined {
  return QUICK_FILTERS.find((filter) => filter.id === id);
}

/** Aplica os recortes ativos; sem nenhum, devolve a lista inteira. */
export function applyQuickFilters(
  events: EventItem[],
  active: QuickFilterId[],
  today = new Date(),
): EventItem[] {
  if (!active.length) return events;

  const filters = active
    .map((id) => findQuickFilter(id))
    .filter((filter): filter is QuickFilter => Boolean(filter));

  return events.filter((event) => filters.every((filter) => filter.match(event, today)));
}

/** Quantos eventos cada recorte encontraria hoje, para o chip mostrar o número. */
export function countByFilter(
  events: EventItem[],
  today = new Date(),
): Record<QuickFilterId, number> {
  const counts = {} as Record<QuickFilterId, number>;
  for (const filter of QUICK_FILTERS) {
    counts[filter.id] = events.filter((event) => filter.match(event, today)).length;
  }
  return counts;
}

function isQuickFilterId(value: string): value is QuickFilterId {
  return QUICK_FILTERS.some((filter) => filter.id === value);
}

/**
 * Lê `?filtro=hoje,gratis` da URL.
 *
 * Descarta o que não reconhece em vez de reclamar: um link antigo com um
 * recorte que não existe mais deve abrir a home, não uma tela de erro.
 */
export function parseQuickFilters(value: unknown): QuickFilterId[] {
  const parts =
    typeof value === "string" ? value.split(",") : Array.isArray(value) ? value.map(String) : [];

  const seen = new Set<QuickFilterId>();
  for (const part of parts) {
    const id = part.trim();
    if (isQuickFilterId(id)) seen.add(id);
  }
  return [...seen];
}
