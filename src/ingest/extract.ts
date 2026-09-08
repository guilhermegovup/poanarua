import type { RawEvent } from "./types";

/**
 * Extratores genéricos, por ordem de confiabilidade:
 *
 * 1. JSON-LD `schema.org/Event` — é o que portais de turismo e agendas
 *    culturais publicam para aparecer no Google. Quando existe, é estruturado
 *    e não quebra a cada redesenho do site.
 * 2. RSS / Atom — feed de agenda, comum em portais WordPress.
 *
 * Só quando nenhum dos dois existe é que vale escrever seletores de HTML para
 * um site específico, e esses ficam em `sources/`.
 */

/* --------------------------------------------------------------- utilidades */

function decodeEntities(input: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return input
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => named[name] ?? match);
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve uma URL relativa contra a página onde ela foi encontrada. */
export function absoluteUrl(value: string | undefined, base: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ JSON-LD */

type JsonValue = Record<string, unknown>;

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  return undefined;
};

/** schema.org aceita valor único ou lista em quase todo campo. */
const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

function readPlace(
  node: unknown,
): Pick<RawEvent, "address" | "locality" | "latitude" | "longitude"> {
  const place = first(node) as JsonValue | undefined;
  if (!place || typeof place !== "object") return {};

  const address = first(place["address"]);
  const geo = first(place["geo"]) as JsonValue | undefined;

  const parts: (string | undefined)[] = [];
  let locality: string | undefined;

  if (typeof address === "string") {
    parts.push(address);
  } else if (address && typeof address === "object") {
    const postal = address as JsonValue;
    parts.push(
      asString(postal["streetAddress"]),
      asString(postal["addressLocality"]),
      asString(postal["addressRegion"]),
    );
    locality = asString(postal["addressLocality"]);
  }

  const placeName = asString(place["name"]);
  const full = [placeName, ...parts].filter(Boolean).join(" - ");

  const result: Pick<RawEvent, "address" | "locality" | "latitude" | "longitude"> = {};
  if (full) result.address = full;
  if (locality) result.locality = locality;
  if (geo) {
    const lat = asString(geo["latitude"]);
    const lon = asString(geo["longitude"]);
    if (lat) result.latitude = lat;
    if (lon) result.longitude = lon;
  }
  return result;
}

function readOffers(node: unknown): string | undefined {
  const offer = first(node) as JsonValue | undefined;
  if (!offer || typeof offer !== "object") return undefined;

  const price = asString(offer["price"]);
  if (price === "0" || price === "0.00") return "Gratuito";
  const currency = asString(offer["priceCurrency"]);
  if (price) return currency ? `${currency} ${price}` : price;
  return undefined;
}

function nodeToRawEvent(node: JsonValue, pageUrl: string): RawEvent | null {
  const name = asString(node["name"]);
  if (!name) return null;

  const image = first(node["image"]);
  const imageUrl =
    typeof image === "string" ? image : asString((image as JsonValue | undefined)?.["url"]);

  const organizer = first(node["organizer"]) as JsonValue | string | undefined;

  const keywords = node["keywords"];
  const keywordList =
    typeof keywords === "string"
      ? keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : Array.isArray(keywords)
        ? keywords.map((item) => String(item))
        : undefined;

  const event: RawEvent = { name };

  const description = asString(node["description"]);
  if (description) event.description = description;

  const startDate = asString(node["startDate"]);
  if (startDate) event.startDate = startDate;

  const endDate = asString(node["endDate"]);
  if (endDate) event.endDate = endDate;

  Object.assign(event, readPlace(node["location"]));

  const resolvedImage = absoluteUrl(imageUrl, pageUrl);
  if (resolvedImage) event.imageUrl = resolvedImage;

  const url = absoluteUrl(asString(node["url"]) ?? pageUrl, pageUrl);
  if (url) event.url = url;

  const externalId = asString(node["identifier"]) ?? asString(node["@id"]);
  if (externalId) event.externalId = externalId;

  if (keywordList?.length) event.keywords = keywordList;

  const offers = readOffers(node["offers"]);
  if (offers) event.offers = offers;

  const organizerName = typeof organizer === "string" ? organizer : asString(organizer?.["name"]);
  if (organizerName) event.organizer = organizerName;

  return event;
}

/** Percorre o JSON-LD inteiro, inclusive @graph e listas aninhadas. */
function collectEventNodes(value: unknown, found: JsonValue[] = []): JsonValue[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectEventNodes(item, found));
    return found;
  }

  if (!value || typeof value !== "object") return found;

  const node = value as JsonValue;
  const type = node["@type"];
  const types = Array.isArray(type) ? type.map(String) : type ? [String(type)] : [];

  // "Event", mas também "MusicEvent", "Festival", "ChildrensEvent"...
  if (types.some((item) => /Event$|^Festival$/i.test(item))) {
    found.push(node);
  }

  if (node["@graph"]) collectEventNodes(node["@graph"], found);
  if (node["itemListElement"]) collectEventNodes(node["itemListElement"], found);
  if (node["item"]) collectEventNodes(node["item"], found);

  return found;
}

export function extractJsonLd(body: string, pageUrl: string): RawEvent[] {
  const scripts = body.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  const events: RawEvent[] = [];

  for (const match of scripts) {
    const raw = match[1];
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      // Um JSON-LD malformado não pode derrubar a coleta da página inteira.
      continue;
    }

    for (const node of collectEventNodes(parsed)) {
      const event = nodeToRawEvent(node, pageUrl);
      if (event) events.push(event);
    }
  }

  return events;
}

/* ---------------------------------------------------------------- RSS/Atom */

function tagContent(block: string, tag: string): string | undefined {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!match?.[1]) return undefined;
  const cdata = /<!\[CDATA\[([\s\S]*?)\]\]>/.exec(match[1]);
  return (cdata?.[1] ?? match[1]).trim() || undefined;
}

export function extractFeed(body: string, pageUrl: string): RawEvent[] {
  const isAtom = /<feed[\s>]/i.test(body);
  const itemTag = isAtom ? "entry" : "item";
  const blocks = body.matchAll(new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)</${itemTag}>`, "gi"));

  const events: RawEvent[] = [];

  for (const match of blocks) {
    const block = match[1];
    if (!block) continue;

    const title = tagContent(block, "title");
    if (!title) continue;

    const link = tagContent(block, "link") ?? /<link[^>]+href=["']([^"']+)["']/i.exec(block)?.[1];

    const description =
      tagContent(block, "content:encoded") ??
      tagContent(block, "description") ??
      tagContent(block, "summary");

    const published =
      tagContent(block, "pubDate") ??
      tagContent(block, "published") ??
      tagContent(block, "updated");

    const image =
      /<enclosure[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ??
      /<media:content[^>]+url=["']([^"']+)["']/i.exec(block)?.[1] ??
      (description ? /<img[^>]+src=["']([^"']+)["']/i.exec(description)?.[1] : undefined);

    const categories = [...block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
      .map((item) => stripTags(item[1] ?? ""))
      .filter(Boolean);

    const event: RawEvent = { name: stripTags(title) };

    if (description) event.description = description;
    if (published) event.startDate = published;

    const url = absoluteUrl(link?.trim(), pageUrl);
    if (url) event.url = url;

    const resolvedImage = absoluteUrl(image, pageUrl);
    if (resolvedImage) event.imageUrl = resolvedImage;

    const guid = tagContent(block, "guid") ?? tagContent(block, "id");
    if (guid) event.externalId = guid;

    if (categories.length) event.keywords = categories;

    events.push(event);
  }

  return events;
}

/** Tenta JSON-LD e cai para o feed. Serve para a maioria das fontes. */
export function extractStandard(body: string, pageUrl: string): RawEvent[] {
  const structured = extractJsonLd(body, pageUrl);
  if (structured.length) return structured;
  return extractFeed(body, pageUrl);
}

export { stripTags, decodeEntities };
