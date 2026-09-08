/**
 * Modelos de dados da API do Poa na Rua, reconstruídos a partir dos payloads
 * do app 2.7.1 publicado na Play Store. O contrato é o mesmo que o app nativo
 * em `mobile/` consome, para que os dois falem com o mesmo backend.
 */

export type ContactType = "site" | "facebook" | "instagram" | "whatsapp";

/** 'TOP' abre o carrossel da home, 'END' é o banner do rodapé. */
export type BannerSlot = "TOP" | "CENTER" | "END" | "NORMAL";

export interface UploadedFile {
  id?: number;
  url: string;
  name?: string;
  path?: string;
}

export interface Category {
  id: number;
  name: string;
  order: number;
  name_image?: string;
  path?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  /** usado apenas nos formulários de cadastro */
  checked?: boolean;
}

export interface Tag {
  id?: number;
  name: string;
  checked?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Links úteis exibidos no bloco "LINKS ÚTEIS" da tela de evento. */
export interface Flag {
  id: number;
  name: string;
  link?: string;
  url?: string;
}

export interface Contact {
  id?: number;
  type: ContactType;
  value: string;
}

export interface EventLocation {
  latitude: string | number;
  longitude: string | number;
}

export interface Evaluation {
  id: number;
  name: string;
  avatar: string | null;
  comment: string;
  note: number;
  last_comment: string;
}

export interface GoEventUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface GalleryImage {
  id: number;
  url: string;
  user_id?: number;
  event_id?: number;
}

export interface EventItem {
  id: number;
  name: string;
  /** HTML vindo do CMS */
  description: string;
  address: string;
  /** 'DD/MM/YYYY' já formatado pelo backend */
  event_date: string;
  /** ISO */
  date: string;
  /** ISO, presente em eventos com período */
  date_final?: string | null;
  /** '18:00-24:00' */
  hour: string;
  featured: boolean;
  bora: boolean;
  prioritized: boolean;
  banner: BannerSlot | null;
  visibility?: boolean;
  image: UploadedFile;
  image_banner?: UploadedFile;
  gallery: GalleryImage[];
  categories: Category[];
  tags: Tag[];
  flags: Flag[];
  evaluations: Evaluation[];
  contacts: Contact[];
  locations: EventLocation[];
  user_id?: number;
  favorite?: boolean;
}

export interface EventFavorite {
  id?: number;
  event_id: number;
  user_id?: number;
  favorite: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  photo?: string;
  avatar?: UploadedFile | null;
  provider?: "EMAIL" | "GOOGLE" | "FACEBOOK" | "APPLE";
}

export interface Session {
  user: User;
  token: string;
}

export interface AppUpdate {
  platform: "ios" | "android";
  version: string;
  show: boolean;
}

export interface InAppMessage {
  id: number;
  show: boolean;
  image?: UploadedFile;
  link?: string;
  title?: string;
}

/** Corpo enviado em POST /event e PUT /event/:id. */
export interface EventPayload {
  id?: number;
  name: string;
  image_id?: number;
  description: string;
  date: string;
  date_final: string;
  locations: EventLocation[];
  address: string;
  categories: number[];
  hour: string;
  tags: Tag[];
  contacts: Contact[];
}
