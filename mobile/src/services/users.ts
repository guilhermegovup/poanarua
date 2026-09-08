import api from './api';
import type { Session, UploadedFile, User } from '~/types';

export const GetToken = (credentials: { email: string; password: string }) =>
  api.post<Session>('/sessions', credentials);

export const CreateUser = (payload: {
  name: string;
  email: string;
  password: string;
}) => api.post<User>('/users', payload);

export const UpdateUserData = (user: Partial<User> & { id: number }) =>
  api.put<User>(`/users/${user.id}`, user);

export const SendImageToServer = (file: {
  uri: string;
  name?: string;
  type?: string;
}) => {
  const data = new FormData();
  data.append('file', {
    uri: file.uri,
    name: file.name ?? 'avatar.jpg',
    type: file.type ?? 'image/jpeg',
  } as unknown as Blob);
  data.append('uri', file.uri);

  return api.post<UploadedFile>('/files', data, {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  });
};
