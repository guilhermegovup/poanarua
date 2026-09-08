import type {
  Category,
  Evaluation,
  EventItem,
  EventPayload,
  EventStatus,
  GoEventUser,
  Tag,
} from "./types";
import {
  EVENT_SELECT,
  toCategory,
  toEvaluation,
  toEvent,
  toEventRow,
  toGoEventUser,
  type CategoryRow,
  type EventRow,
} from "./mappers";
import { requireSupabase } from "./supabase";

/**
 * Implementação das operações de dados contra o Postgres do Lovable Cloud.
 *
 * As policies do banco é que garantem a segurança — o público só enxerga
 * evento publicado, escrever é de quem está na tabela `admins`. Aqui não há
 * checagem de permissão: o cliente não é lugar para isso.
 */

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getUser();
  return data.user?.id ?? null;
}

/* ------------------------------------------------------------------ leitura */

export async function events(): Promise<EventItem[]> {
  const rows = unwrap(
    await requireSupabase()
      .from("events")
      .select(EVENT_SELECT)
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .returns<EventRow[]>(),
  );

  return withFavorites(rows.map(toEvent));
}

export async function adminEvents(): Promise<EventItem[]> {
  const rows = unwrap(
    await requireSupabase()
      .from("events")
      .select(EVENT_SELECT)
      .order("starts_at", { ascending: false })
      .returns<EventRow[]>(),
  );

  return rows.map(toEvent);
}

export async function event(id: number): Promise<EventItem | undefined> {
  const { data, error } = await requireSupabase()
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .maybeSingle<EventRow>();

  if (error) throw new Error(error.message);
  if (!data) return undefined;

  const [withFavorite] = await withFavorites([toEvent(data)]);
  return withFavorite;
}

export async function categories(): Promise<Category[]> {
  const rows = unwrap(
    await requireSupabase()
      .from("categories")
      .select('id, name, "order", image_url')
      .order("order", { ascending: true })
      .returns<CategoryRow[]>(),
  );
  return rows.map(toCategory);
}

export async function tags(): Promise<Tag[]> {
  return unwrap(
    await requireSupabase().from("tags").select("id, name").order("name").returns<Tag[]>(),
  );
}

/* ---------------------------------------------------------------- favoritos */

async function withFavorites(list: EventItem[]): Promise<EventItem[]> {
  const userId = await currentUserId();
  if (!userId || !list.length) return list;

  const rows = unwrap(
    await requireSupabase()
      .from("event_favorites")
      .select("event_id")
      .eq("user_id", userId)
      .returns<{ event_id: number }[]>(),
  );

  const favorites = new Set(rows.map((row) => row.event_id));
  return list.map((item) => ({ ...item, favorite: favorites.has(item.id) }));
}

export async function favorites(): Promise<EventItem[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  const rows = unwrap(
    await requireSupabase()
      .from("event_favorites")
      .select(`events ( ${EVENT_SELECT} )`)
      .eq("user_id", userId)
      .returns<{ events: EventRow | null }[]>(),
  );

  return rows
    .map((row) => row.events)
    .filter((item): item is EventRow => Boolean(item))
    .map((item) => ({ ...toEvent(item), favorite: true }));
}

export async function setFavorite(eventId: number, favorite: boolean): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Entra na tua conta para favoritar.");

  const client = requireSupabase();

  if (favorite) {
    const { error } = await client
      .from("event_favorites")
      .upsert({ user_id: userId, event_id: eventId });
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client
    .from("event_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);
}

/* ---------------------------------------------------------------- presenças */

export async function goEventUsers(eventId: number): Promise<GoEventUser[]> {
  const rows = unwrap(
    await requireSupabase()
      .from("event_attendances")
      .select("user_id, profiles ( name, avatar_url )")
      .eq("event_id", eventId)
      .returns<
        { user_id: string; profiles: { name: string; avatar_url: string | null } | null }[]
      >(),
  );

  return rows.map((row) =>
    toGoEventUser({
      user_id: row.user_id,
      profile_name: row.profiles?.name ?? null,
      profile_avatar: row.profiles?.avatar_url ?? null,
    }),
  );
}

export async function toggleGoEvent(eventId: number): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Entra na tua conta para marcar presença.");

  const client = requireSupabase();

  const existing = unwrap(
    await client
      .from("event_attendances")
      .select("event_id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .returns<{ event_id: number }[]>(),
  );

  if (existing.length) {
    const { error } = await client
      .from("event_attendances")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await client
    .from("event_attendances")
    .insert({ user_id: userId, event_id: eventId });
  if (error) throw new Error(error.message);
  return true;
}

/* ---------------------------------------------------------------- opiniões */

export async function evaluations(eventId: number): Promise<Evaluation[]> {
  const rows = unwrap(
    await requireSupabase()
      .from("event_evaluations")
      .select("id, note, comment, created_at, profiles ( name, avatar_url )")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .returns<
        {
          id: number;
          note: number;
          comment: string;
          created_at: string;
          profiles: { name: string; avatar_url: string | null } | null;
        }[]
      >(),
  );

  return rows.map((row) =>
    toEvaluation({
      id: row.id,
      note: row.note,
      comment: row.comment,
      created_at: row.created_at,
      profile_name: row.profiles?.name ?? null,
      profile_avatar: row.profiles?.avatar_url ?? null,
    }),
  );
}

export async function addEvaluation(
  eventId: number,
  comment: string,
  note: number,
): Promise<Evaluation> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Entra na tua conta para comentar.");

  const row = unwrap(
    await requireSupabase()
      .from("event_evaluations")
      // Uma opinião por pessoa por evento: comentar de novo atualiza a anterior.
      .upsert(
        { event_id: eventId, user_id: userId, comment, note },
        { onConflict: "event_id,user_id" },
      )
      .select("id, note, comment, created_at, profiles ( name, avatar_url )")
      .single<{
        id: number;
        note: number;
        comment: string;
        created_at: string;
        profiles: { name: string; avatar_url: string | null } | null;
      }>(),
  );

  return toEvaluation({
    id: row.id,
    note: row.note,
    comment: row.comment,
    created_at: row.created_at,
    profile_name: row.profiles?.name ?? null,
    profile_avatar: row.profiles?.avatar_url ?? null,
  });
}

/* ----------------------------------------------------------------- escrita */

/** Regrava as ligações N:N do evento (categorias, tags e contatos). */
async function saveRelations(eventId: number, payload: Partial<EventPayload>): Promise<void> {
  const client = requireSupabase();

  if (payload.categories) {
    await client.from("event_categories").delete().eq("event_id", eventId);
    if (payload.categories.length) {
      const { error } = await client.from("event_categories").insert(
        payload.categories.map((categoryId) => ({
          event_id: eventId,
          category_id: categoryId,
        })),
      );
      if (error) throw new Error(error.message);
    }
  }

  if (payload.tags) {
    await client.from("event_tags").delete().eq("event_id", eventId);
    const names = payload.tags.map((tag) => tag.name);
    if (names.length) {
      const rows = unwrap(
        await client
          .from("tags")
          .select("id, name")
          .in("name", names)
          .returns<{ id: number; name: string }[]>(),
      );
      if (rows.length) {
        const { error } = await client
          .from("event_tags")
          .insert(rows.map((tag) => ({ event_id: eventId, tag_id: tag.id })));
        if (error) throw new Error(error.message);
      }
    }
  }

  if (payload.contacts) {
    await client.from("event_contacts").delete().eq("event_id", eventId);
    const filled = payload.contacts.filter((contact) => contact.value.trim());
    if (filled.length) {
      const { error } = await client.from("event_contacts").insert(
        filled.map((contact) => ({
          event_id: eventId,
          type: contact.type,
          value: contact.value.trim(),
        })),
      );
      if (error) throw new Error(error.message);
    }
  }
}

export async function createEvent(
  payload: EventPayload & { image?: string },
  status: EventStatus = "pending",
): Promise<EventItem> {
  const userId = await currentUserId();

  const row = unwrap(
    await requireSupabase()
      .from("events")
      .insert({
        ...toEventRow(payload),
        status,
        ...(userId ? { created_by: userId } : {}),
      })
      .select("id")
      .single<{ id: number }>(),
  );

  await saveRelations(row.id, payload);

  const created = await event(row.id);
  if (!created) throw new Error("Evento criado mas não encontrado.");
  return created;
}

export async function updateEvent(
  id: number,
  payload: Partial<EventPayload> & { image?: string },
): Promise<void> {
  const fields = toEventRow(payload);

  if (Object.keys(fields).length) {
    const { error } = await requireSupabase().from("events").update(fields).eq("id", id);
    if (error) throw new Error(error.message);
  }

  await saveRelations(id, payload);
}

export async function setStatusMany(ids: number[], status: EventStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await requireSupabase().from("events").update({ status }).in("id", ids);
  if (error) throw new Error(error.message);
}

export async function deleteMany(ids: number[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await requireSupabase().from("events").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export async function myEvents(): Promise<EventItem[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  const rows = unwrap(
    await requireSupabase()
      .from("events")
      .select(EVENT_SELECT)
      .eq("created_by", userId)
      .order("starts_at", { ascending: false })
      .returns<EventRow[]>(),
  );

  return rows.map(toEvent);
}

/* --------------------------------------------------------------- importação */

export async function knownDedupeKeys(): Promise<Set<string>> {
  const rows = unwrap(
    await requireSupabase()
      .from("events")
      .select("dedupe_key")
      .not("dedupe_key", "is", null)
      .returns<{ dedupe_key: string }[]>(),
  );
  return new Set(rows.map((row) => row.dedupe_key));
}

/**
 * Grava o que o coletor trouxe. `dedupe_key` é único no banco, então usamos
 * `ignoreDuplicates` para uma corrida entre duas importações não quebrar.
 */
export async function importEvents(list: EventItem[]): Promise<number> {
  if (!list.length) return 0;

  const client = requireSupabase();

  const rows = unwrap(
    await client
      .from("events")
      .upsert(
        list.map((item) => ({
          name: item.name,
          description: item.description,
          address: item.address,
          starts_at: item.date,
          ends_at: item.date_final,
          hour: item.hour,
          image_url: item.image.url,
          banner: item.banner,
          latitude: item.locations[0]?.latitude ? Number(item.locations[0].latitude) : null,
          longitude: item.locations[0]?.longitude ? Number(item.locations[0].longitude) : null,
          status: "pending" as const,
          source_id: item.source?.id ?? null,
          source_name: item.source?.name ?? null,
          source_url: item.source?.url ?? null,
          external_id: item.source?.external_id ?? null,
          imported_at: item.source?.imported_at ?? new Date().toISOString(),
          dedupe_key: item.dedupe_key ?? null,
        })),
        { onConflict: "dedupe_key", ignoreDuplicates: true },
      )
      .select("id, dedupe_key")
      .returns<{ id: number; dedupe_key: string | null }[]>(),
  );

  // Só os que entraram de fato recebem categorias e tags.
  const byKey = new Map(list.map((item) => [item.dedupe_key, item]));
  for (const row of rows) {
    const original = byKey.get(row.dedupe_key ?? undefined);
    if (!original) continue;
    await saveRelations(row.id, {
      categories: original.categories.map((category) => category.id),
      tags: original.tags,
      contacts: original.contacts,
    });
  }

  return rows.length;
}

/* ------------------------------------------------------------------- admin */

export async function isAdmin(): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;

  const { data, error } = await requireSupabase()
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
