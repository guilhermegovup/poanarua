import dayjs from 'dayjs';

import { SESSION_TTL_HOURS } from '~/config';
import { storage } from '~/storage';
import type { Session, User } from '~/types';

/** O app original marca como "Anonimo" quem entra sem cadastro. */
export const ANONYMOUS_NAME = 'Anonimo';

export async function expiredSession(): Promise<boolean> {
  const since = await storage.getLocationSession();
  if (!since) return true;
  return dayjs().diff(dayjs(since), 'hour') >= SESSION_TTL_HOURS;
}

export async function saveLogin(session: Session) {
  await storage.setLocationSession(dayjs().format());
  await storage.setToken(session.token);
  await storage.setUser(session.user);
}

export async function clearCache() {
  await storage.clear();
}

/** True quando existe um usuário de verdade logado (não o modo anônimo). */
export async function allowedUser(): Promise<boolean> {
  const user = await storage.getUser();
  const token = await storage.getToken();
  return Boolean(user && user.name !== ANONYMOUS_NAME && token);
}

export async function enterAsAnonymous(): Promise<User> {
  const user: User = { id: 0, name: ANONYMOUS_NAME, email: '' };
  await storage.setUser(user);
  await storage.setToken('anonimo');
  await storage.setLocationSession(dayjs().format());
  return user;
}
