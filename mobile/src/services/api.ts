import axios, { AxiosError } from 'axios';

import { BASE_URL, ENVIRONMENT, TOKEN, USE_MOCK } from '~/config';

import { mockAdapter } from './mock/adapter';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const instance = axios.create({
  baseURL: BASE_URL(ENVIRONMENT),
  timeout: 20000,
  paramsSerializer: {
    indexes: null,
  },
});

if (USE_MOCK) {
  instance.defaults.adapter = mockAdapter;
}

instance.interceptors.request.use(async (config) => {
  const token = await TOKEN();
  if (token) {
    config.headers.set('Authorization', token);
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      const body = error.response.data;
      const message =
        body?.error ?? body?.message ?? 'Ocorreu um erro inesperado, favor tente novamente.';
      return Promise.reject(new ApiError(message, error.response.status));
    }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError('Sem conexão com a internet. Verifica tua rede e tenta de novo.'),
      );
    }

    return Promise.reject(new ApiError(error.message));
  },
);

/**
 * Os interceptors acima já devolvem `response.data`, então tipamos o cliente
 * para que as funções de serviço não precisem lidar com `AxiosResponse`.
 */
export const api = instance as unknown as {
  get<T>(url: string, config?: object): Promise<T>;
  post<T>(url: string, data?: unknown, config?: object): Promise<T>;
  put<T>(url: string, data?: unknown, config?: object): Promise<T>;
  delete<T>(url: string, config?: object): Promise<T>;
};

export default api;
