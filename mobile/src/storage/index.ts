import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Category, EventItem, Tag, User } from '~/types';

const KEYS = {
  USER: '@logged_user',
  TOKEN: '@token',
  TOKEN_FIREBASE: '@tokenFirebase',
  TOKEN_FACEBOOK: '@tokenFacebook',
  CURRENT_TIME: '@currentTime',
  LOCATION: '@location',
  MEDIA_SOCIAL: '@mediaSocial',
  EVENTS: '@events',
  CATEGORIES: '@categories',
  TAGS: '@tags',
  IN_APP_SEE_MESSAGE: '@inAppSeeMessage',
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    if (value === null || value === undefined) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage indisponível: seguimos sem cache */
  }
}

async function readString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeString(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    /* idem */
  }
}

export const storage = {
  setUser: (user: User | null) => writeJson(KEYS.USER, user),
  getUser: () => readJson<User>(KEYS.USER),

  setToken: (token: string | null) => writeString(KEYS.TOKEN, token),
  getToken: () => readString(KEYS.TOKEN),

  setTokenFirebase: (token: string | null) =>
    writeString(KEYS.TOKEN_FIREBASE, token),
  getTokenFirebase: () => readString(KEYS.TOKEN_FIREBASE),

  setTokenFacebook: (token: string | null) =>
    writeString(KEYS.TOKEN_FACEBOOK, token),
  getTokenFacebook: () => readString(KEYS.TOKEN_FACEBOOK),

  setCurrentTime: (time: string | null) => writeString(KEYS.CURRENT_TIME, time),
  getCurrentTime: () => readString(KEYS.CURRENT_TIME),

  /** Momento do último login, usado para expirar a sessão. */
  setLocationSession: (time: string | null) => writeString(KEYS.LOCATION, time),
  getLocationSession: () => readString(KEYS.LOCATION),

  setMediaSocial: (media: string | null) =>
    writeString(KEYS.MEDIA_SOCIAL, media),
  getMediaSocial: () => readString(KEYS.MEDIA_SOCIAL),

  setEvents: (events: EventItem[]) => writeJson(KEYS.EVENTS, events),
  getEvents: () => readJson<EventItem[]>(KEYS.EVENTS),

  setCategories: (categories: Category[]) =>
    writeJson(KEYS.CATEGORIES, categories),
  getCategories: () => readJson<Category[]>(KEYS.CATEGORIES),

  setTags: (tags: Tag[]) => writeJson(KEYS.TAGS, tags),
  getTags: () => readJson<Tag[]>(KEYS.TAGS),

  setInAppSeeMessage: (message: { id: number }) =>
    writeJson(KEYS.IN_APP_SEE_MESSAGE, message),
  getInAppSeeMessage: () => readJson<{ id: number }>(KEYS.IN_APP_SEE_MESSAGE),

  clear: async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch {
      /* idem */
    }
  },
};

export default storage;
