import { API_BASE_URL, USE_MOCK } from "./config";
import * as remote from "./remote";
import { store } from "./store";
import { isRemote } from "./supabase";
import type {
  Category,
  Evaluation,
  EventItem,
  EventPayload,
  EventStatus,
  Flag,
  GalleryImage,
  GoEventUser,
  Tag,
} from "./types";

/**
 * Superfície de dados do site, com três origens possíveis:
 *
 * 1. Postgres do Lovable Cloud, quando as variáveis do Supabase existem;
 * 2. a API original do app (`poanarua.com.br/api`), se ela voltar ao ar;
 * 3. o store local em `localStorage`, para o preview funcionar sem nada ligado.
 *
 * As telas não sabem qual está valendo — o formato dos dados é o mesmo nos três.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Erro ${response.status} em ${path}`);
  }

  return response.json() as Promise<T>;
}

/** Latência curta no mock para os skeletons aparecerem, como no app original. */
const tick = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 180));

export const api = {
  events: (): Promise<EventItem[]> =>
    isRemote ? remote.events() : USE_MOCK ? tick(store.events()) : request<EventItem[]>("/events"),

  event: async (id: number): Promise<EventItem | undefined> => {
    if (isRemote) return remote.event(id);
    if (USE_MOCK) return tick(store.event(id));
    const { event } = await request<{ event: EventItem }>(`/event/${id}`);
    return event;
  },

  categories: (): Promise<Category[]> =>
    isRemote
      ? remote.categories()
      : USE_MOCK
        ? tick(store.categories())
        : request<Category[]>("/category"),

  tags: (): Promise<Tag[]> =>
    isRemote ? remote.tags() : USE_MOCK ? tick(store.tags()) : request<Tag[]>("/tag"),

  flags: (): Promise<Flag[]> => (USE_MOCK ? tick(store.flags()) : request<Flag[]>("/flag")),

  favorites: (): Promise<EventItem[]> =>
    isRemote
      ? remote.favorites()
      : USE_MOCK
        ? tick(store.favoriteEvents())
        : request<EventItem[]>(`/eventfavorite/user/${store.user()?.id ?? 0}`),

  setFavorite: (eventId: number, favorite: boolean): Promise<void> => {
    if (isRemote) return remote.setFavorite(eventId, favorite);
    if (USE_MOCK) {
      store.setFavorite(eventId, favorite);
      return Promise.resolve();
    }
    return request<void>(`/eventfavorite/${eventId}`, {
      method: "PUT",
      body: JSON.stringify({ event_id: eventId, favorite }),
    });
  },

  goEventUsers: (eventId: number): Promise<GoEventUser[]> =>
    isRemote
      ? remote.goEventUsers(eventId)
      : USE_MOCK
        ? tick(store.goEventUsers(eventId))
        : request<GoEventUser[]>(`/goevent/${eventId}`),

  toggleGoEvent: (eventId: number): Promise<boolean> => {
    if (isRemote) return remote.toggleGoEvent(eventId);
    if (USE_MOCK) return Promise.resolve(store.toggleGoEvent(eventId));
    return request<{ go: boolean }>("/goevent", {
      method: "PUT",
      body: JSON.stringify({ event_id: eventId, user_id: store.user()?.id }),
    }).then((result) => result.go);
  },

  evaluations: (eventId: number): Promise<Evaluation[]> =>
    isRemote
      ? remote.evaluations(eventId)
      : USE_MOCK
        ? tick(store.evaluations(eventId))
        : request<Evaluation[]>(`/evaluation/${eventId}`),

  addEvaluation: (eventId: number, comment: string, note: number): Promise<Evaluation> => {
    if (isRemote) return remote.addEvaluation(eventId, comment, note);
    if (USE_MOCK) return Promise.resolve(store.addEvaluation(eventId, comment, note));
    return request<Evaluation>("/evaluation", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, comment, note }),
    });
  },

  gallery: (eventId: number): Promise<GalleryImage[]> =>
    USE_MOCK ? tick(store.gallery(eventId)) : request<GalleryImage[]>(`/gallery/${eventId}`),

  myEvents: (): Promise<EventItem[]> =>
    isRemote
      ? remote.myEvents()
      : USE_MOCK
        ? tick(store.myEvents())
        : request<EventItem[]>("/event_by_user"),

  /* --------------------------------------------------------------- webadmin */

  /** Tudo, inclusive pendente e oculto. */
  adminEvents: (): Promise<EventItem[]> =>
    isRemote
      ? remote.adminEvents()
      : USE_MOCK
        ? tick(store.allEvents())
        : request<EventItem[]>("/admin/events"),

  setStatus: (id: number, status: EventStatus): Promise<void> => {
    if (isRemote) return remote.setStatusMany([id], status);
    if (USE_MOCK) {
      store.setStatus(id, status);
      return Promise.resolve();
    }
    return request<void>(`/admin/event/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  setStatusMany: (ids: number[], status: EventStatus): Promise<void> => {
    if (isRemote) return remote.setStatusMany(ids, status);
    if (USE_MOCK) {
      store.setStatusMany(ids, status);
      return Promise.resolve();
    }
    return request<void>("/admin/events/status", {
      method: "PUT",
      body: JSON.stringify({ ids, status }),
    });
  },

  deleteMany: (ids: number[]): Promise<void> => {
    if (isRemote) return remote.deleteMany(ids);
    if (USE_MOCK) {
      store.deleteMany(ids);
      return Promise.resolve();
    }
    return request<void>("/admin/events", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },

  updateEvent: (id: number, payload: Partial<EventPayload> & { image?: string }): Promise<void> => {
    if (isRemote) return remote.updateEvent(id, payload);
    if (USE_MOCK) {
      store.updateEvent(id, payload);
      return Promise.resolve();
    }
    return request<void>(`/event/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  importEvents: (events: EventItem[]): Promise<number> => {
    if (isRemote) return remote.importEvents(events);
    if (USE_MOCK) return Promise.resolve(store.importEvents(events));
    return request<{ imported: number }>("/admin/import", {
      method: "POST",
      body: JSON.stringify({ events }),
    }).then((result) => result.imported);
  },

  knownDedupeKeys: (): Promise<Set<string>> =>
    isRemote
      ? remote.knownDedupeKeys()
      : USE_MOCK
        ? Promise.resolve(store.knownDedupeKeys())
        : request<string[]>("/admin/dedupe-keys").then((keys) => new Set(keys)),

  createEvent: (payload: EventPayload & { image?: string }): Promise<EventItem> => {
    if (isRemote) return remote.createEvent(payload);
    if (USE_MOCK) return Promise.resolve(store.createEvent(payload));
    return request<{ event: EventItem }>("/event", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((result) => result.event);
  },

  deleteEvent: (id: number): Promise<void> => {
    if (isRemote) return remote.deleteMany([id]);
    if (USE_MOCK) {
      store.deleteEvent(id);
      return Promise.resolve();
    }
    return request<void>(`/event/${id}`, { method: "DELETE" });
  },
};
