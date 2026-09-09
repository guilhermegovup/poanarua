import { categories as allCategories, tags as allTags } from "@/data/seed";
import type { Category, EventItem, EventSource, Tag } from "@/data/types";

import { stripTags } from "./extract";
import type { RawEvent } from "./types";

/**
 * Converte o que o coletor achou em um `EventItem` pronto para revisão.
 *
 * A inferência de categoria e tag é por palavra-chave: erra de vez em quando,
 * e é exatamente por isso que nada entra publicado — o webadmin é onde a
 * curadoria acontece.
 */

/* --------------------------------------------------------------------- datas */

const MONTHS: Record<string, number> = {
  janeiro: 0,
  jan: 0,
  fevereiro: 1,
  fev: 1,
  março: 2,
  marco: 2,
  mar: 2,
  abril: 3,
  abr: 3,
  maio: 4,
  mai: 4,
  junho: 5,
  jun: 5,
  julho: 6,
  jul: 6,
  agosto: 7,
  ago: 7,
  setembro: 8,
  set: 8,
  outubro: 9,
  out: 9,
  novembro: 10,
  nov: 10,
  dezembro: 11,
  dez: 11,
};

/**
 * Aceita ISO, "12/10/2026", "12 de outubro de 2026" e "12 de outubro" (sem
 * ano, assumindo a próxima ocorrência). Devolve ISO ou null.
 */
export function parseDate(value: string | undefined, today = new Date()): string | null {
  if (!value) return null;
  const text = value.trim();
  if (!text) return null;

  const iso = new Date(text);
  if (!Number.isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}|GMT|UTC|[+-]\d{2}:?\d{2}/.test(text)) {
    return iso.toISOString();
  }

  const numeric = /(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?/.exec(text);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = numeric[3]
      ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3])
      : today.getFullYear();
    const date = buildDate(year, month, day, text, today, !numeric[3]);
    if (date) return date;
  }

  const written = /(\d{1,2})\s*(?:de\s*)?([a-zà-ú]+)(?:\s*(?:de\s*)?(\d{4}))?/i.exec(text);
  if (written) {
    const day = Number(written[1]);
    const month = MONTHS[(written[2] ?? "").toLowerCase()];
    if (month !== undefined) {
      const year = written[3] ? Number(written[3]) : today.getFullYear();
      const date = buildDate(year, month, day, text, today, !written[3]);
      if (date) return date;
    }
  }

  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
}

function buildDate(
  year: number,
  month: number,
  day: number,
  text: string,
  today: Date,
  rollForward: boolean,
): string | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;

  const time = /(\d{1,2})[h:](\d{2})?/.exec(text);
  const hours = time ? Number(time[1]) : 12;
  const minutes = time?.[2] ? Number(time[2]) : 0;

  let date = new Date(year, month, day, hours, minutes, 0, 0);
  if (Number.isNaN(date.getTime())) return null;

  // "12 de outubro" sem ano, já passado, quase sempre quer dizer o ano que vem.
  if (rollForward && date.getTime() < today.getTime() - 7 * 24 * 3600 * 1000) {
    date = new Date(year + 1, month, day, hours, minutes, 0, 0);
  }

  return date.toISOString();
}

/** "das 13h às 21h" / "13:00 - 21:00" viram "13:00-21:00". */
export function parseHour(value: string | undefined): string {
  if (!value) return "";

  const matches = [...value.matchAll(/(\d{1,2})\s*(?::|h)\s*(\d{2})?/g)]
    .map((match) => {
      const hour = Number(match[1]);
      if (hour > 23) return null;
      return `${String(hour).padStart(2, "0")}:${match[2] ?? "00"}`;
    })
    .filter((item): item is string => item !== null);

  if (!matches.length) return "";
  if (matches.length === 1) return matches[0]!;
  return `${matches[0]}-${matches[1]}`;
}

/* ------------------------------------------------- categorias, tags e limpeza */

const normalizeText = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Palavras que indicam cada categoria. A ordem importa: a primeira categoria
 * que casar entra primeiro na lista.
 */
const CATEGORY_HINTS: { id: number; words: string[] }[] = [
  {
    id: 47,
    words: [
      "crianc",
      "infantil",
      "infanto",
      "kids",
      "para toda a familia",
      "familia",
      "contacao de historia",
      "brinquedo",
      "recreacao",
      "teatro infantil",
      "oficina infantil",
      "parquinho",
      "bebe",
    ],
  },
  {
    id: 22,
    words: ["organic", "ecologic", "agroecolog", "feira modelo", "hortifruti", "produtor rural"],
  },
  {
    id: 45,
    words: ["artesanat", "brecho", "bazar", "economia criativa", "handmade", "autoral"],
  },
  {
    id: 41,
    words: [
      "show",
      "musica",
      "banda",
      "dj",
      "sarau",
      "concerto",
      "festival de musica",
      "samba",
      "rock",
    ],
  },
  {
    id: 42,
    words: [
      "gastronom",
      "food truck",
      "comida",
      "culinar",
      "cerveja",
      "chef",
      "restaurante",
      "cafe",
    ],
  },
  {
    id: 46,
    words: [
      "turism",
      "ponto turistico",
      "passeio",
      "visita guiada",
      "city tour",
      "mirante",
      "museu",
    ],
  },
  {
    id: 43,
    words: ["parque", "praca", "orla", "redencao", "farroupilha", "ar livre", "piquenique"],
  },
  {
    id: 44,
    words: ["arte", "cultura", "exposic", "teatro", "cinema", "danca", "literatura", "poesia"],
  },
  {
    id: 40,
    words: ["feira", "rua", "bloco", "desfile", "carnaval", "evento de rua"],
  },
];

const TAG_HINTS: { name: string; words: string[] }[] = [
  { name: "PARA CRIANÇAS", words: ["crianc", "infantil", "kids", "familia", "bebe"] },
  { name: "GRATUITO", words: ["gratuit", "gratis", "entrada franca", "livre acesso", "sem custo"] },
  { name: "AO AR LIVRE", words: ["ar livre", "parque", "praca", "orla", "rua", "open air"] },
  { name: "PET FRIENDLY", words: ["pet", "cachorr", "animal de estimacao"] },
  { name: "FEIRA DE RUA", words: ["feira"] },
  { name: "SHOW", words: ["show", "banda", "dj", "musica ao vivo"] },
  { name: "RESTAURANTE", words: ["restaurante", "bar ", "bistro"] },
  { name: "FESTAS", words: ["festa", "balada", "festival"] },
];

function haystack(raw: RawEvent): string {
  return normalizeText(
    [
      raw.name,
      stripTags(raw.description ?? ""),
      raw.address,
      raw.organizer,
      raw.offers,
      ...(raw.keywords ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function inferCategories(raw: RawEvent): Category[] {
  const text = haystack(raw);
  const matched = CATEGORY_HINTS.filter((hint) => hint.words.some((word) => text.includes(word)))
    .map((hint) => allCategories.find((category) => category.id === hint.id))
    .filter((category): category is Category => Boolean(category))
    .slice(0, 3);

  // Sem pista nenhuma, "EVENTOS DE RUA" é o balde genérico do Poa na Rua.
  if (matched.length) return matched;
  const fallback = allCategories.find((category) => category.id === 40);
  return fallback ? [fallback] : [];
}

export function inferTags(raw: RawEvent): Tag[] {
  const text = haystack(raw);
  return TAG_HINTS.filter((hint) => hint.words.some((word) => text.includes(word)))
    .map((hint) => allTags.find((tag) => tag.name === hint.name))
    .filter((tag): tag is Tag => Boolean(tag))
    .slice(0, 5);
}

/* ------------------------------------------------------------------- dedupe */

/**
 * Mesma chave = mesmo evento. Junta nome enxuto e dia, para reconhecer o
 * mesmo rolê anunciado por duas fontes com títulos ligeiramente diferentes.
 */
export function dedupeKey(name: string, isoDate: string | null): string {
  const slug = normalizeText(name)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(o|a|os|as|de|da|do|das|dos|e|em|no|na|nos|nas|com|para|pra)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 6)
    .join("-");

  const day = isoDate ? isoDate.slice(0, 10) : "sem-data";
  return `${slug}@${day}`;
}

/* ---------------------------------------------------------------- normalize */

let nextId = Date.now();

export function normalizeEvent(
  raw: RawEvent,
  source: EventSource,
  today = new Date(),
): EventItem | null {
  const name = stripTags(raw.name).trim();
  if (!name) return null;

  const date = parseDate(raw.startDate, today);
  const endDate = parseDate(raw.endDate, today);

  const description = raw.description?.trim() ?? "";
  // Fonte que sabe o próprio horário tem prioridade sobre a adivinhação.
  const hour =
    raw.hour ??
    parseHour([raw.startDate, stripTags(description).slice(0, 400)].filter(Boolean).join(" "));

  const id = nextId++;
  const eventDate = date ? formatBr(date) : "";

  const event: EventItem = {
    id,
    name,
    description,
    address: raw.address ?? "",
    event_date: eventDate,
    date: date ?? today.toISOString(),
    date_final: endDate,
    hour,
    featured: false,
    bora: false,
    prioritized: false,
    banner: "NORMAL",
    visibility: true,
    image: {
      url: raw.imageUrl ?? `https://picsum.photos/seed/evento-${id}/800/600`,
    },
    gallery: [],
    categories: inferCategories(raw),
    tags: inferTags(raw),
    flags: [],
    evaluations: [],
    contacts: raw.url ? [{ type: "site", value: raw.url }] : [],
    locations:
      raw.latitude && raw.longitude ? [{ latitude: raw.latitude, longitude: raw.longitude }] : [],
    status: "pending",
    source: {
      ...source,
      ...(raw.url ? { url: raw.url } : {}),
      ...(raw.externalId ? { external_id: raw.externalId } : {}),
      imported_at: today.toISOString(),
    },
    dedupe_key: dedupeKey(name, date),
  };

  return event;
}

function formatBr(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Exposto só para os testes conseguirem ids estáveis. */
export function __resetIds(value: number) {
  nextId = value;
}
