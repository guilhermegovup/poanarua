import { Platform } from 'react-native';

import { storage } from '~/storage';

export type Environment = 'LOCAL' | 'DEV' | 'PROD';

/**
 * Endereços da API original do Poa na Rua. `LOCAL` aponta para o servidor
 * rodando na máquina do dev, exatamente como no app publicado.
 */
export function BASE_URL(env: Environment): string {
  switch (env) {
    case 'LOCAL':
      return Platform.OS === 'ios'
        ? 'http://localhost:7000/api'
        : 'http://10.0.2.2:7000/api';
    case 'DEV':
    case 'PROD':
    default:
      return 'https://poanarua.com.br/api';
  }
}

/**
 * Enquanto a API original não estiver no ar, o app roda contra o dataset
 * local em `src/services/mock`. Basta virar para `false` (ou definir
 * EXPO_PUBLIC_USE_MOCK=false) para falar com o backend de verdade.
 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const ENVIRONMENT: Environment =
  (process.env.EXPO_PUBLIC_ENV as Environment) ?? 'DEV';

/** Minutos de validade da sessão antes de renovar o token. */
export const SESSION_TTL_HOURS = 24;

export const CONTACT = {
  EMAIL: 'contato@poanarua.com.br',
  WHATSAPP: '+5551996033460',
  INSTAGRAM: 'poanarua',
  FACEBOOK: 'poanarua',
  SITE: 'https://poanarua.com.br/',
  TERMS: 'https://poa-na-rua-0.flycricket.io/terms.html',
  PRIVACY: 'https://poa-na-rua-0.flycricket.io/privacy.html',
  PLAY_STORE:
    'https://play.google.com/store/apps/details?id=com.guiipf.poanaruaoficial',
};

export async function TOKEN(): Promise<string | undefined> {
  const token = await storage.getToken();
  return token ? `Bearer ${token}` : undefined;
}
