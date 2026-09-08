import { API_BASE_URL, USE_MOCK } from "./config";
import { store } from "./store";
import type {
  Category,
  Evaluation,
  EventItem,
  EventPayload,
  Flag,
  GalleryImage,
  GoEventUser,
  Tag,
} from "./types";

/**
 * Superfície de dados do site.
 *
 * Cada função tem um par: a leitura do store local e a chamada equivalente na
 * API original do app (mesmos caminhos, verbos e payloads). `USE_MOCK` decide
 * qual dos dois roda.
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
    USE_MOCK ? tick(store.events()) : request<EventItem[]>("/events"),

  event: async (id: number): Promise<EventItem | undefined> => {
    if (USE_MOCK) return tick(store.event(id));
    const { event } = await request<{ event: EventItem }>(`/event/${id}`);
    return event;
  },

  categories: (): Promise<Category[]> =>
    USE_MOCK ? tick(store.categories()) : request<Category[]>("/category"),

  tags: (): Promise<Tag[]> => (USE_MOCK ? tick(store.tags()) : request<Tag[]>("/tag")),

  flags: (): Promise<Flag[]> => (USE_MOCK ? tick(store.flags()) : request<Flag[]>("/flag")),

  favorites: (): Promise<EventItem[]> =>
    USE_MOCK
      ? tick(store.favoriteEvents())
      : request<EventItem[]>(`/eventfavorite/user/${store.user()?.id ?? 0}`),

  setFavorite: (eventId: number, favorite: boolean): Promise<void> => {
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
    USE_MOCK ? tick(store.goEventUsers(eventId)) : request<GoEventUser[]>(`/goevent/${eventId}`),

  toggleGoEvent: (eventId: number): Promise<boolean> => {
    if (USE_MOCK) return Promise.resolve(store.toggleGoEvent(eventId));
    return request<{ go: boolean }>("/goevent", {
      method: "PUT",
      body: JSON.stringify({ event_id: eventId, user_id: store.user()?.id }),
    }).then((result) => result.go);
  },

  evaluations: (eventId: number): Promise<Evaluation[]> =>
    USE_MOCK ? tick(store.evaluations(eventId)) : request<Evaluation[]>(`/evaluation/${eventId}`),

  addEvaluation: (eventId: number, comment: string, note: number): Promise<Evaluation> => {
    if (USE_MOCK) return Promise.resolve(store.addEvaluation(eventId, comment, note));
    return request<Evaluation>("/evaluation", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, comment, note }),
    });
  },

  gallery: (eventId: number): Promise<GalleryImage[]> =>
    USE_MOCK ? tick(store.gallery(eventId)) : request<GalleryImage[]>(`/gallery/${eventId}`),

  myEvents: (): Promise<EventItem[]> =>
    USE_MOCK ? tick(store.myEvents()) : request<EventItem[]>("/event_by_user"),

  createEvent: (payload: EventPayload & { image?: string }): Promise<EventItem> => {
    if (USE_MOCK) return Promise.resolve(store.createEvent(payload));
    return request<{ event: EventItem }>("/event", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((result) => result.event);
  },

  deleteEvent: (id: number): Promise<void> => {
    if (USE_MOCK) {
      store.deleteEvent(id);
      return Promise.resolve();
    }
    return request<void>(`/event/${id}`, { method: "DELETE" });
  },
};
