import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';

import type {
  Evaluation,
  EventItem,
  GalleryImage,
  GoEventUser,
  Session,
  User,
} from '~/types';

import { state } from './state';

type Handler = (context: {
  params: string[];
  body: any;
  query: Record<string, string>;
}) => Promise<unknown> | unknown;

type Route = { method: string; pattern: RegExp; handler: Handler };

const routes: Route[] = [];

function route(method: string, path: string, handler: Handler) {
  const pattern = new RegExp(
    `^${path.replace(/:[a-zA-Z]+/g, '([^/]+)').replace(/\//g, '\\/')}\\/?$`,
  );
  routes.push({ method, pattern, handler });
}

const notFound = (message: string) => {
  const error = new Error(message) as Error & { status: number };
  error.status = 404;
  throw error;
};

/* ---------------------------------------------------------------- catálogo */

route('get', '/events', async () => (await state.getEvents()).filter((e) => e.visibility !== false));

route('get', '/event/:id', async ({ params }) => {
  const events = await state.getEvents();
  const event = events.find((item) => item.id === Number(params[0]));
  if (!event) notFound('Evento não encontrado.');
  return { event };
});

route('get', '/event_by_user', async () => {
  const user = await state.getCurrentUser();
  if (!user) return [];
  const events = await state.getEvents();
  return events.filter((event) => event.user_id === user.id);
});

route('post', '/event', async ({ body }) => {
  const event = await state.createEvent(body);
  return { event };
});

route('put', '/event/:id', async ({ params, body }) => {
  const event = await state.updateEvent(Number(params[0]), body);
  if (!event) notFound('Evento não encontrado.');
  return { event };
});

route('delete', '/event/:id', async ({ params }) => {
  await state.deleteEvent(Number(params[0]));
  return {};
});

route('get', '/category', () => state.getCategories());
route('get', '/tag', () => state.getTags());
route('get', '/flag', () => state.getFlags());
route('get', '/update', () => state.getAppUpdate());
route('get', '/inappmessage', () => state.getInAppMessage());

/* --------------------------------------------------------------- favoritos */

route('get', '/eventfavorite/event/:id', async ({ params }) => {
  const eventId = Number(params[0]);
  const favorites = await state.getFavorites();
  return { event_id: eventId, favorite: favorites.includes(eventId) };
});

route('put', '/eventfavorite/:id', async ({ params, body }) => {
  const eventId = Number(params[0]);
  const favorite = Boolean(body?.favorite);
  await state.setFavorite(eventId, favorite);
  return { event_id: eventId, favorite };
});

route('get', '/eventfavorite/user/:id', async () => {
  const favorites = await state.getFavorites();
  const events = await state.getEvents();
  return events
    .filter((event) => favorites.includes(event.id))
    .map((event) => ({ ...event, favorite: true }));
});

/* ------------------------------------------------------------------- bora! */

route('get', '/goevent/:id', async ({ params }): Promise<GoEventUser[]> => {
  return state.getGoEventUsers(Number(params[0]));
});

route('get', '/goevent/byid/:id', async ({ params }) => {
  const user = await state.getCurrentUser();
  if (!user) return { go: false };
  const users = await state.getGoEventUsers(Number(params[0]));
  return { go: users.some((item) => item.id === user.id) };
});

route('put', '/goevent', async ({ body }) => {
  const going = await state.toggleGoEvent(Number(body?.event_id));
  return { go: going };
});

/* -------------------------------------------------------------- avaliações */

route('get', '/evaluation/:id', async ({ params }): Promise<Evaluation[]> => {
  return state.getEvaluations(Number(params[0]));
});

route('post', '/evaluation', async ({ body }) => {
  return state.addEvaluation(Number(body?.event_id), String(body?.comment ?? ''), Number(body?.note ?? 0));
});

/* ----------------------------------------------------------------- galeria */

route('get', '/gallery/:id', async ({ params }): Promise<GalleryImage[]> => {
  return state.getGallery(Number(params[0]));
});

route('post', '/gallery', async ({ body }) => {
  const eventId = Number(readFormField(body, 'event_id'));
  const uri = String(readFormField(body, 'uri') ?? '');
  return state.addGalleryImage(eventId, uri);
});

route('delete', '/gallery/:id', async ({ params }) => {
  await state.deleteGalleryImage(Number(params[0]));
  return {};
});

/* ---------------------------------------------------------------- usuários */

route('post', '/sessions', async ({ body }): Promise<Session> => {
  return state.signIn(String(body?.email ?? ''), String(body?.password ?? ''));
});

route('post', '/users', async ({ body }): Promise<User> => {
  return state.signUp(body);
});

route('put', '/users/:id', async ({ params, body }): Promise<User> => {
  return state.updateUser(Number(params[0]), body);
});

route('post', '/files', async ({ body }) => {
  const uri = String(readFormField(body, 'uri') ?? '');
  return state.uploadFile(uri);
});

/* ------------------------------------------------------------------ engine */

function readFormField(body: any, field: string): unknown {
  if (!body) return undefined;
  if (typeof body.get === 'function') {
    const value = body.get(field);
    if (value && typeof value === 'object' && 'uri' in value) return value.uri;
    return value;
  }
  return body[field];
}

function parseBody(data: unknown): any {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/** Latência artificial para que os shimmers de carregamento apareçam. */
const LATENCY_MS = 320;

export const mockAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase();
  const rawUrl = (config.url ?? '').replace(config.baseURL ?? '', '');
  const [path, search] = rawUrl.split('?');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const query = Object.fromEntries(new URLSearchParams(search ?? ''));

  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const match = routes.find(
    (item) => item.method === method && item.pattern.test(normalized),
  );

  const respond = (status: number, data: unknown): AxiosResponse => ({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: config as AxiosResponse['config'],
  });

  if (!match) {
    return Promise.reject(
      Object.assign(new Error(`Rota não implementada no mock: ${method.toUpperCase()} ${normalized}`), {
        response: respond(404, { error: `Rota não implementada no mock: ${normalized}` }),
        config,
        isAxiosError: true,
      }),
    );
  }

  const params = normalized.match(match.pattern)?.slice(1) ?? [];

  try {
    const data = await match.handler({
      params,
      body: parseBody(config.data),
      query,
    });
    return respond(200, data);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    return Promise.reject(
      Object.assign(error as Error, {
        response: respond(status, { error: (error as Error).message }),
        config,
        isAxiosError: true,
      }),
    );
  }
};

export type { EventItem };
