import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppUpdate,
  Category,
  Evaluation,
  EventItem,
  EventPayload,
  Flag,
  GalleryImage,
  GoEventUser,
  InAppMessage,
  Session,
  Tag,
  User,
} from '~/types';

import * as seed from './db';

/**
 * Estado mutável do backend fake. Fica em AsyncStorage para que favoritos,
 * "eu vou", comentários e eventos cadastrados sobrevivam ao reload do app.
 */

const KEY = '@mock_state_v1';

interface MockState {
  events: EventItem[];
  favorites: number[];
  goEvent: Record<number, GoEventUser[]>;
  evaluations: Record<number, Evaluation[]>;
  gallery: Record<number, GalleryImage[]>;
  users: User[];
  nextId: number;
}

let cache: MockState | null = null;
let loading: Promise<MockState> | null = null;

function initialState(): MockState {
  return {
    events: seed.events.map((event) => ({ ...event })),
    favorites: [],
    goEvent: { ...seed.goEvent },
    evaluations: { ...seed.evaluations },
    gallery: {},
    users: [seed.demoUser],
    nextId: 1000,
  };
}

async function load(): Promise<MockState> {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      cache = raw ? (JSON.parse(raw) as MockState) : initialState();
    } catch {
      cache = initialState();
    }
    return cache;
  })();

  return loading;
}

async function persist(next: MockState) {
  cache = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* segue em memória */
  }
}

async function mutate(fn: (draft: MockState) => void) {
  const current = await load();
  const next: MockState = JSON.parse(JSON.stringify(current));
  fn(next);
  await persist(next);
  return next;
}

/** O mock não valida senha: qualquer login com e-mail válido entra. */
const FAKE_TOKEN = 'poanarua.mock.token';

async function getCurrentUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem('@logged_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function brToday() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

export const state = {
  async reset() {
    cache = null;
    loading = null;
    await AsyncStorage.removeItem(KEY);
  },

  getCurrentUser,

  async getEvents(): Promise<EventItem[]> {
    const { events, favorites } = await load();
    return events.map((event) => ({
      ...event,
      favorite: favorites.includes(event.id),
    }));
  },

  getCategories: (): Category[] => seed.categories,
  getTags: (): Tag[] => seed.tags,
  getFlags: (): Flag[] => seed.flags,
  getAppUpdate: (): AppUpdate[] => seed.appUpdate,
  getInAppMessage: (): InAppMessage => seed.inAppMessage,

  async getFavorites(): Promise<number[]> {
    return (await load()).favorites;
  },

  async setFavorite(eventId: number, favorite: boolean) {
    await mutate((draft) => {
      const has = draft.favorites.includes(eventId);
      if (favorite && !has) draft.favorites.push(eventId);
      if (!favorite && has) {
        draft.favorites = draft.favorites.filter((id) => id !== eventId);
      }
    });
  },

  async getGoEventUsers(eventId: number): Promise<GoEventUser[]> {
    return (await load()).goEvent[eventId] ?? [];
  },

  async toggleGoEvent(eventId: number): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    let going = false;
    await mutate((draft) => {
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

  async getEvaluations(eventId: number): Promise<Evaluation[]> {
    return (await load()).evaluations[eventId] ?? [];
  },

  async addEvaluation(eventId: number, comment: string, note: number) {
    const user = await getCurrentUser();
    const evaluation: Evaluation = {
      id: Date.now(),
      name: user?.name ?? 'Anônimo',
      avatar: user?.avatar?.url ?? user?.photo ?? null,
      comment,
      note,
      last_comment: brToday(),
    };
    await mutate((draft) => {
      draft.evaluations[eventId] = [evaluation, ...(draft.evaluations[eventId] ?? [])];
    });
    return evaluation;
  },

  async getGallery(eventId: number): Promise<GalleryImage[]> {
    return (await load()).gallery[eventId] ?? [];
  },

  async addGalleryImage(eventId: number, uri: string) {
    const user = await getCurrentUser();
    const image: GalleryImage = {
      id: Date.now(),
      url: uri,
      event_id: eventId,
      user_id: user?.id,
    };
    await mutate((draft) => {
      draft.gallery[eventId] = [image, ...(draft.gallery[eventId] ?? [])];
    });
    return image;
  },

  async deleteGalleryImage(imageId: number) {
    await mutate((draft) => {
      Object.keys(draft.gallery).forEach((key) => {
        const eventId = Number(key);
        draft.gallery[eventId] = draft.gallery[eventId].filter(
          (image) => image.id !== imageId,
        );
      });
    });
  },

  async createEvent(payload: EventPayload): Promise<EventItem> {
    const user = await getCurrentUser();
    let created: EventItem | null = null;

    await mutate((draft) => {
      const id = draft.nextId++;
      const date = payload.date ?? new Date().toISOString();
      created = {
        id,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        event_date: brToday(),
        date,
        date_final: payload.date_final ?? null,
        hour: payload.hour,
        featured: false,
        bora: false,
        prioritized: false,
        banner: 'NORMAL',
        visibility: true,
        image: {
          url:
            (payload as unknown as { image?: string }).image ??
            `https://picsum.photos/seed/evento-${id}/800/600`,
        },
        gallery: [],
        categories: seed.categories.filter((category) =>
          payload.categories?.includes(category.id),
        ),
        tags: payload.tags ?? [],
        flags: [],
        evaluations: [],
        contacts: payload.contacts ?? [],
        locations: payload.locations ?? [],
        user_id: user?.id,
      };
      draft.events = [created, ...draft.events];
    });

    return created!;
  },

  async updateEvent(id: number, payload: EventPayload): Promise<EventItem | null> {
    let updated: EventItem | null = null;
    await mutate((draft) => {
      const index = draft.events.findIndex((event) => event.id === id);
      if (index < 0) return;
      const current = draft.events[index];
      updated = {
        ...current,
        name: payload.name ?? current.name,
        description: payload.description ?? current.description,
        address: payload.address ?? current.address,
        hour: payload.hour ?? current.hour,
        date: payload.date ?? current.date,
        date_final: payload.date_final ?? current.date_final,
        locations: payload.locations ?? current.locations,
        contacts: payload.contacts ?? current.contacts,
        tags: payload.tags ?? current.tags,
        categories: payload.categories
          ? seed.categories.filter((category) => payload.categories.includes(category.id))
          : current.categories,
        image:
          (payload as unknown as { image?: string }).image
            ? { url: (payload as unknown as { image: string }).image }
            : current.image,
      };
      draft.events[index] = updated;
    });
    return updated;
  },

  async deleteEvent(id: number) {
    await mutate((draft) => {
      draft.events = draft.events.filter((event) => event.id !== id);
    });
  },

  async signIn(email: string, _password: string): Promise<Session> {
    const { users } = await load();
    const existing = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existing) {
      return { user: existing, token: FAKE_TOKEN };
    }

    let user: User | null = null;
    await mutate((draft) => {
      user = {
        id: draft.nextId++,
        name: email.split('@')[0],
        email,
        provider: 'EMAIL',
      };
      draft.users.push(user);
    });
    return { user: user!, token: FAKE_TOKEN };
  },

  async signUp(payload: { name: string; email: string }): Promise<User> {
    const { users } = await load();
    if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
      const error = new Error('Já existe uma conta criado com esse email.') as Error & {
        status: number;
      };
      error.status = 400;
      throw error;
    }

    let user: User | null = null;
    await mutate((draft) => {
      user = {
        id: draft.nextId++,
        name: payload.name,
        email: payload.email,
        provider: 'EMAIL',
      };
      draft.users.push(user);
    });
    return user!;
  },

  async updateUser(id: number, payload: Partial<User>): Promise<User> {
    let updated: User | null = null;
    await mutate((draft) => {
      const index = draft.users.findIndex((user) => user.id === id);
      const base = index >= 0 ? draft.users[index] : { ...seed.demoUser, id };
      updated = { ...base, ...payload, id };
      if (index >= 0) draft.users[index] = updated;
      else draft.users.push(updated);
    });
    return updated!;
  },

  uploadFile(uri: string) {
    return { id: Date.now(), url: uri, name: 'upload.jpg', path: 'upload.jpg' };
  },
};
