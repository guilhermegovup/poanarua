import type {
  Evaluation,
  EventItem,
  EventPayload,
  EventStatus,
  GalleryImage,
  GoEventUser,
  User,
} from "./types";
import * as seed from "./seed";

/**
 * Backend local do Poa na Rua.
 *
 * Enquanto `poanarua.com.br/api` estiver fora do ar, tudo que o app lê e
 * escreve vive aqui, em `localStorage`. O formato é o mesmo da API original,
 * então `src/data/api.ts` pode trocar de fonte sem tocar em nenhuma tela.
 */

const KEY = "poanarua:store:v1";

interface StoreState {
  events: EventItem[];
  favorites: number[];
  goEvent: Record<number, GoEventUser[]>;
  evaluations: Record<number, Evaluation[]>;
  gallery: Record<number, GalleryImage[]>;
  user: User | null;
  nextId: number;
}

function initialState(): StoreState {
  return {
    events: seed.events.map((event) => ({ ...event })),
    favorites: [],
    goEvent: { ...seed.goEvent },
    evaluations: { ...seed.evaluations },
    gallery: {},
    user: null,
    nextId: 1000,
  };
}

let memory: StoreState | null = null;

/** No servidor (SSR) não existe localStorage: caímos no estado em memória. */
function read(): StoreState {
  if (memory) return memory;

  if (typeof window === "undefined") {
    memory = initialState();
    return memory;
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as StoreState) : initialState();
  } catch {
    memory = initialState();
  }

  return memory;
}

function write(next: StoreState) {
  memory = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* modo privado ou cota cheia: seguimos só em memória */
  }
}

function mutate(fn: (draft: StoreState) => void) {
  const next: StoreState = structuredClone(read());
  fn(next);
  write(next);
  notify();
  return next;
}

/* --------------------------------------------------- assinatura de mudanças */

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------------------------------------------ leitura */

function brToday() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

/** Dados legados não têm `status`; quem não tem é porque já estava no ar. */
function isPublished(event: EventItem): boolean {
  return (event.status ?? "published") === "published";
}

export const store = {
  /** O que o site mostra: só o que está publicado. */
  events(): EventItem[] {
    return store.allEvents().filter(isPublished);
  },

  /** Tudo, inclusive pendente, oculto e rejeitado. Só o webadmin usa. */
  allEvents(): EventItem[] {
    const state = read();
    return state.events.map((event) => ({
      ...event,
      status: event.status ?? "published",
      favorite: state.favorites.includes(event.id),
    }));
  },

  event(id: number): EventItem | undefined {
    return store.allEvents().find((event) => event.id === id);
  },

  categories: () => seed.categories,
  tags: () => seed.tags,
  flags: () => seed.flags,

  favorites: (): number[] => read().favorites,

  favoriteEvents(): EventItem[] {
    return store.events().filter((event) => event.favorite);
  },

  setFavorite(eventId: number, favorite: boolean) {
    mutate((draft) => {
      const has = draft.favorites.includes(eventId);
      if (favorite && !has) draft.favorites.push(eventId);
      if (!favorite && has) {
        draft.favorites = draft.favorites.filter((id) => id !== eventId);
      }
    });
  },

  goEventUsers: (eventId: number): GoEventUser[] => read().goEvent[eventId] ?? [],

  isGoing(eventId: number): boolean {
    const state = read();
    if (!state.user) return false;
    return (state.goEvent[eventId] ?? []).some((item) => item.id === state.user!.id);
  },

  toggleGoEvent(eventId: number): boolean {
    const user = read().user;
    if (!user) return false;

    let going = false;
    mutate((draft) => {
      const list = draft.goEvent[eventId] ?? [];
      const index = list.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        list.splice(index, 1);
      } else {
        list.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar?.url ?? user.photo ?? null,
        });
        going = true;
      }
      draft.goEvent[eventId] = list;
    });
    return going;
  },

  evaluations: (eventId: number): Evaluation[] => read().evaluations[eventId] ?? [],

  addEvaluation(eventId: number, comment: string, note: number): Evaluation {
    const user = read().user;
    const evaluation: Evaluation = {
      id: Date.now(),
      name: user?.name ?? "Anônimo",
      avatar: user?.avatar?.url ?? user?.photo ?? null,
      comment,
      note,
      last_comment: brToday(),
    };
    mutate((draft) => {
      draft.evaluations[eventId] = [evaluation, ...(draft.evaluations[eventId] ?? [])];
    });
    return evaluation;
  },

  gallery: (eventId: number): GalleryImage[] => read().gallery[eventId] ?? [],

  addGalleryImage(eventId: number, url: string): GalleryImage {
    const user = read().user;
    const image: GalleryImage = { id: Date.now(), url, event_id: eventId };
    if (user) image.user_id = user.id;
    mutate((draft) => {
      draft.gallery[eventId] = [image, ...(draft.gallery[eventId] ?? [])];
    });
    return image;
  },

  removeGalleryImage(imageId: number) {
    mutate((draft) => {
      Object.keys(draft.gallery).forEach((key) => {
        const eventId = Number(key);
        draft.gallery[eventId] = (draft.gallery[eventId] ?? []).filter(
          (image) => image.id !== imageId,
        );
      });
    });
  },

  /* ------------------------------------------------------------- usuário */

  user: (): User | null => read().user,

  signIn(email: string, name?: string): User {
    let user: User | undefined;
    mutate((draft) => {
      const next: User = {
        id: draft.user?.id ?? draft.nextId++,
        name: name ?? draft.user?.name ?? email.split("@")[0] ?? "Anônimo",
        email,
        provider: "EMAIL",
      };
      user = next;
      draft.user = next;
    });
    return user as User;
  },

  updateUser(patch: Partial<User>): User | null {
    let user: User | undefined;
    mutate((draft) => {
      if (!draft.user) return;
      draft.user = { ...draft.user, ...patch };
      user = draft.user;
    });
    return user ?? null;
  },

  signOut() {
    mutate((draft) => {
      draft.user = null;
    });
  },

  /* -------------------------------------------------------------- eventos */

  myEvents(): EventItem[] {
    const state = read();
    if (!state.user) return [];
    return store.events().filter((event) => event.user_id === state.user!.id);
  },

  createEvent(payload: EventPayload & { image?: string }): EventItem {
    const user = read().user;
    let created: EventItem | undefined;

    mutate((draft) => {
      const id = draft.nextId++;
      const event: EventItem = {
        id,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        event_date: brToday(),
        date: payload.date || new Date().toISOString(),
        date_final: payload.date_final || null,
        hour: payload.hour,
        featured: false,
        bora: false,
        prioritized: false,
        banner: "NORMAL",
        visibility: true,
        image: { url: payload.image || `https://picsum.photos/seed/evento-${id}/800/600` },
        gallery: [],
        categories: seed.categories.filter((category) => payload.categories?.includes(category.id)),
        tags: payload.tags ?? [],
        flags: [],
        evaluations: [],
        contacts: payload.contacts ?? [],
        locations: payload.locations ?? [],
      };
      if (user) event.user_id = user.id;
      created = event;
      draft.events = [event, ...draft.events];
    });

    return created as EventItem;
  },

  updateEvent(id: number, payload: Partial<EventPayload> & { image?: string }) {
    mutate((draft) => {
      const index = draft.events.findIndex((event) => event.id === id);
      const current = index >= 0 ? draft.events[index] : undefined;
      if (!current) return;
      draft.events[index] = {
        ...current,
        name: payload.name ?? current.name,
        description: payload.description ?? current.description,
        address: payload.address ?? current.address,
        hour: payload.hour ?? current.hour,
        date: payload.date ?? current.date,
        date_final: payload.date_final ?? current.date_final ?? null,
        locations: payload.locations ?? current.locations,
        contacts: payload.contacts ?? current.contacts,
        tags: payload.tags ?? current.tags,
        categories: payload.categories
          ? seed.categories.filter((category) => payload.categories!.includes(category.id))
          : current.categories,
        image: payload.image ? { url: payload.image } : current.image,
      };
    });
  },

  deleteEvent(id: number) {
    mutate((draft) => {
      draft.events = draft.events.filter((event) => event.id !== id);
    });
  },

  /* --------------------------------------------------------------- webadmin */

  setStatus(id: number, status: EventStatus) {
    mutate((draft) => {
      const event = draft.events.find((item) => item.id === id);
      if (event) event.status = status;
    });
  },

  setStatusMany(ids: number[], status: EventStatus) {
    const wanted = new Set(ids);
    mutate((draft) => {
      draft.events.forEach((event) => {
        if (wanted.has(event.id)) event.status = status;
      });
    });
  },

  deleteMany(ids: number[]) {
    const wanted = new Set(ids);
    mutate((draft) => {
      draft.events = draft.events.filter((event) => !wanted.has(event.id));
    });
  },

  /** Chaves de dedupe já na base, para o coletor não trazer repetido. */
  knownDedupeKeys(): Set<string> {
    return new Set(
      read()
        .events.map((event) => event.dedupe_key)
        .filter((key): key is string => Boolean(key)),
    );
  },

  /**
   * Guarda o que o coletor trouxe. Já veio deduplicado contra a base, então
   * aqui só descartamos colisão de chave por segurança.
   */
  importEvents(events: EventItem[]): number {
    const known = store.knownDedupeKeys();
    const novos = events.filter((event) => !event.dedupe_key || !known.has(event.dedupe_key));
    if (!novos.length) return 0;

    mutate((draft) => {
      let id = draft.nextId;
      const prepared = novos.map((event) => ({ ...event, id: id++ }));
      draft.nextId = id;
      draft.events = [...prepared, ...draft.events];
    });

    return novos.length;
  },

  reset() {
    memory = null;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(KEY);
      } catch {
        /* ignora */
      }
    }
    notify();
  },
};
