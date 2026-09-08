import api from './api';
import type { Category } from '~/types';

export const GetAllCategories = () => api.get<Category[]>('/category');
