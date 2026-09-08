import api from './api';
import type {
  Evaluation,
  EventFavorite,
  EventItem,
  EventPayload,
  GalleryImage,
  GoEventUser,
  Tag,
} from '~/types';

export const GetAllPlaces = () => api.get<EventItem[]>('/events');

export const GetMyEvents = () => api.get<EventItem[]>('/event_by_user');

export const GetAllTags = () => api.get<Tag[]>('/tag');

export const GetPlaceById = (id: number) =>
  api.get<{ event: EventItem }>(`/event/${id}`);

export const GetEventFavorite = (id: number) =>
  api.get<EventFavorite>(`/eventfavorite/event/${id}`);

export const SetFavoritePlace = (favorite: EventFavorite) =>
  api.put<EventFavorite>(`/eventfavorite/${favorite.event_id}`, {
    event_id: favorite.event_id,
    favorite: favorite.favorite,
  });

export const GetEventsFavorite = (userId: number) =>
  api.get<EventItem[]>(`/eventfavorite/user/${userId}`);

export const GetUserGoEvent = (eventId: number) =>
  api.get<{ go: boolean }>(`/goevent/byid/${eventId}`);

export const GetUsersGoEvent = (eventId: number) =>
  api.get<GoEventUser[]>(`/goevent/${eventId}`);

export const ImGoEvent = (eventId: number, userId: number) =>
  api.put<{ go: boolean }>('/goevent', { event_id: eventId, user_id: userId });

export const GetEvaluationsEvent = (eventId: number) =>
  api.get<Evaluation[]>(`/evaluation/${eventId}`);

export const PostSendOpinion = (opinion: {
  event_id: number;
  comment: string;
  note: number;
}) => api.post<Evaluation>('/evaluation', opinion);

export const GetImagesEvent = (eventId: number) =>
  api.get<GalleryImage[]>(`/gallery/${eventId}`);

export const SendImageEvent = ({
  event_id,
  file,
}: {
  event_id: number;
  file: { uri: string; name?: string; type?: string };
}) => {
  const data = new FormData();
  data.append('event_id', String(event_id));
  data.append('file', {
    uri: file.uri,
    name: file.name ?? 'foto.jpg',
    type: file.type ?? 'image/jpeg',
  } as unknown as Blob);
  // O mock lê `uri` direto; o backend real usa o campo `file`.
  data.append('uri', file.uri);

  return api.post<GalleryImage>('/gallery', data, {
    headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
  });
};

export const DeleteImageGallery = (imageId: number) =>
  api.delete<void>(`/gallery/${imageId}`);

export const CreateEvent = (payload: EventPayload) =>
  api.post<{ event: EventItem }>('/event', payload);

export const UpdateEvent = (payload: EventPayload) =>
  api.put<{ event: EventItem }>(`/event/${payload.id}`, payload);

export const DeleteEvent = (id: number) => api.delete<void>(`/event/${id}`);
