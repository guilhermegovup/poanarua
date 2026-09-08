import type { Category, EventItem, InAppMessage, Tag } from '~/types';

export type RootStackParamList = {
  Splash: undefined;

  /* fluxo de entrada */
  Login: undefined;
  LoginWithEmail: undefined;
  RegisterUser: undefined;
  RecoverPassword: undefined;
  UpdateApp: { update: { version: string } };

  /* app logado */
  Main: undefined;
  CategoryList: { category: Category };
  DescriptionEvent: { event: EventItem };
  About: undefined;
  Edit: undefined;
  FavoritesEvents: undefined;
  MyEvents: undefined;
  RegisterEvent: { event?: EventItem } | undefined;
  Search: { events: EventItem[] };
  SendOpinion: { event: EventItem };
  Maps: {
    latitude?: string | number;
    longitude?: string | number;
    onConfirm?: (coords: { latitude: string; longitude: string }) => void;
  };
  CategoriesByRegister: {
    selected: Category[];
    onConfirm: (categories: Category[]) => void;
  };
  ContactsByRegister: {
    selected: { type: string; value: string }[];
    onConfirm: (contacts: { type: string; value: string }[]) => void;
  };
  CallShowRoutes: { latitude: string | number; longitude: string | number; name: string };
  InAppMessage: { data: InAppMessage };
  OpenLinks: { url: string; title?: string };
  Photos: undefined;
};

export type TabParamList = {
  Home: undefined;
  Perfil: undefined;
};

export type { Category, EventItem, Tag };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
