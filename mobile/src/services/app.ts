import api from './api';
import type { AppUpdate, Flag, InAppMessage, Tag } from '~/types';

export const GetTags = () => api.get<Tag[]>('/tag');

export const GetFlags = () => api.get<Flag[]>('/flag');

export const CheckUpdateApp = () => api.get<AppUpdate[]>('/update');

export const GetInAppMessage = () => api.get<InAppMessage>('/inappmessage');
