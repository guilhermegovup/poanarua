import type {
  Category,
  Contact,
  ContactType,
  Evaluation,
  EventItem,
  EventPayload,
  EventStatus,
  GoEventUser,
  Tag,
} from "./types";

/**
 * Tradução entre as linhas do Postgres (snake_case, relacional) e o
 * `EventItem` que as telas consomem — o mesmo formato da API original do app.
 * Concentrar isso aqui deixa o resto do código alheio ao banco.
 */

export interface EventRow {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  starts_at: string;
  ends_at: string | null;
  hour: string | null;
  image_url: string | null;
  banner: string | null;
  featured: boolean;
  prioritized: boolean;
  latitude: number | string | null;
  longitude: number | string | null;
  status: EventStatus;
  source_id: string | null;
  source_name: string | null;
  source_url: string | null;
  external_id: string | null;
  imported_at: string | null;
  dedupe_key: string | null;
  created_by: string | null;
  event_categories?: { categories: CategoryRow | null }[] | null;
  event_tags?: { tags: { id: number; name: string } | null }[] | null;
  event_contacts?: { id: number; type: string; value: string }[] | null;
}

export interface CategoryRow {
  id: number;
  name: string;
  order: number;
  image_url: string | null;
}

const pad = (value: number) => String(value).padStart(2, "0");

function toBrDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function toCategory(row: CategoryRow): Category {
  const category: Category = { id: row.id, name: row.name, order: row.order };
  if (row.image_url) category.url = row.image_url;
  return category;
}

const CONTACT_TYPES: ContactType[] = ["site", "facebook", "instagram", "whatsapp"];

const isContactType = (value: string): value is ContactType =>
  (CONTACT_TYPES as string[]).includes(value);

export function toEvent(row: EventRow): EventItem {
  const categories =
    row.event_categories
      ?.map((link) => link.categories)
      .filter((category): category is CategoryRow => Boolean(category))
      .map(toCategory) ?? [];

  const tags: Tag[] =
    row.event_tags
      ?.map((link) => link.tags)
      .filter((tag): tag is { id: number; name: string } => Boolean(tag))
      .map((tag) => ({ id: tag.id, name: tag.name })) ?? [];

  const contacts: Contact[] =
    row.event_contacts
      ?.filter((contact) => isContactType(contact.type))
      .map((contact) => ({
        id: contact.id,
        type: contact.type as ContactType,
        value: contact.value,
      })) ?? [];

  const event: EventItem = {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    address: row.address ?? "",
    event_date: toBrDate(row.starts_at),
    date: row.starts_at,
    date_final: row.ends_at,
    hour: row.hour ?? "",
    featured: row.featured,
    bora: false,
    prioritized: row.prioritized,
    banner: (row.banner as EventItem["banner"]) ?? "NORMAL",
    visibility: true,
    image: {
      url: row.image_url ?? "",
    },
    gallery: [],
    categories,
    tags,
    flags: [],
    evaluations: [],
    contacts,
    locations:
      row.latitude !== null && row.longitude !== null
        ? [{ latitude: String(row.latitude), longitude: String(row.longitude) }]
        : [],
    status: row.status,
  };

  if (row.dedupe_key) event.dedupe_key = row.dedupe_key;

  if (row.source_id) {
    event.source = {
      id: row.source_id,
      name: row.source_name ?? row.source_id,
      ...(row.source_url ? { url: row.source_url } : {}),
      ...(row.external_id ? { external_id: row.external_id } : {}),
      ...(row.imported_at ? { imported_at: row.imported_at } : {}),
    };
  }

  return event;
}

export interface EvaluationRow {
  id: number;
  note: number;
  comment: string;
  created_at: string;
  profile_name?: string | null;
  profile_avatar?: string | null;
}

export function toEvaluation(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    name: row.profile_name ?? "Anônimo",
    avatar: row.profile_avatar ?? null,
    comment: row.comment,
    note: row.note,
    last_comment: toBrDate(row.created_at),
  };
}

export function toGoEventUser(row: {
  user_id: string;
  profile_name?: string | null;
  profile_avatar?: string | null;
}): GoEventUser {
  return {
    // A lista só precisa de uma chave estável e das iniciais.
    id: Number.parseInt(row.user_id.replace(/\D/g, "").slice(0, 9) || "0", 10),
    name: row.profile_name ?? "Alguém",
    avatar: row.profile_avatar ?? null,
  };
}

/** Campos da tabela `events` a partir do payload dos formulários. */
export function toEventRow(
  payload: Partial<EventPayload> & { image?: string },
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (payload.name !== undefined) row["name"] = payload.name;
  if (payload.description !== undefined) row["description"] = payload.description;
  if (payload.address !== undefined) row["address"] = payload.address;
  if (payload.date) row["starts_at"] = payload.date;
  if (payload.date_final !== undefined) row["ends_at"] = payload.date_final || null;
  if (payload.hour !== undefined) row["hour"] = payload.hour;
  if (payload.image !== undefined) row["image_url"] = payload.image;

  const location = payload.locations?.[0];
  if (payload.locations) {
    row["latitude"] = location?.latitude ? Number(location.latitude) : null;
    row["longitude"] = location?.longitude ? Number(location.longitude) : null;
  }

  return row;
}

/** Select com os relacionamentos que o `EventItem` precisa. */
export const EVENT_SELECT = `
  *,
  event_categories ( categories ( id, name, "order", image_url ) ),
  event_tags ( tags ( id, name ) ),
  event_contacts ( id, type, value )
`;
