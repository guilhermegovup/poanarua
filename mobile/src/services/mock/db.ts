import type {
  AppUpdate,
  Category,
  Evaluation,
  EventItem,
  Flag,
  GoEventUser,
  InAppMessage,
  Tag,
  User,
} from '~/types';

/**
 * Dataset local que substitui a API enquanto poanarua.com.br/api estiver fora.
 * A forma dos objetos é a mesma que o app original recebia do backend.
 */

const image = (seed: string, w = 800, h = 600) => ({
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  name: `${seed}.jpg`,
  path: `${seed}.jpg`,
});

const iso = (daysFromToday: number, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const br = (isoDate: string) => {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const categories: Category[] = [
  { id: 22, name: 'FEIRAS MODELO E ORGÂNICAS', order: 1, seed: 'poa-feira-organica' },
  { id: 40, name: 'EVENTOS DE RUA', order: 2, seed: 'poa-evento-rua' },
  { id: 41, name: 'MÚSICA E SHOWS', order: 3, seed: 'poa-musica' },
  { id: 42, name: 'GASTRONOMIA', order: 4, seed: 'poa-gastronomia' },
  { id: 43, name: 'PARQUES E PRAÇAS', order: 5, seed: 'poa-parques' },
  { id: 44, name: 'ARTE E CULTURA', order: 6, seed: 'poa-arte' },
].map(({ seed: imageSeed, ...category }) => ({
  ...category,
  name_image: `${category.name.toLowerCase()}.png`,
  path: `${imageSeed}.png`,
  url: image(imageSeed, 400, 400).url,
}));

export const tags: Tag[] = [
  { id: 98, name: 'FEIRA DE RUA' },
  { id: 99, name: 'FESTAS' },
  { id: 100, name: 'SHOW' },
  { id: 101, name: 'RESTAURANTE' },
  { id: 102, name: 'AO AR LIVRE' },
  { id: 103, name: 'GRATUITO' },
  { id: 104, name: 'PET FRIENDLY' },
  { id: 105, name: 'PARA CRIANÇAS' },
];

export const flags: Flag[] = [
  { id: 1, name: 'Evento gratuito' },
  { id: 2, name: 'Acessível para cadeirantes' },
  { id: 3, name: 'Pet friendly' },
  { id: 4, name: 'Ingressos', link: 'https://poanarua.com.br/' },
];

const tag = (name: string) => tags.find((item) => item.name === name)!;
const category = (id: number) => categories.find((item) => item.id === id)!;

type Seed = {
  id: number;
  name: string;
  description: string;
  address: string;
  hour: string;
  days: number;
  daysFinal?: number;
  banner: EventItem['banner'];
  featured?: boolean;
  prioritized?: boolean;
  categoryIds: number[];
  tagNames: string[];
  latitude: string;
  longitude: string;
  seed: string;
  flagIds?: number[];
  instagram?: string;
  whatsapp?: string;
  site?: string;
};

const seeds: Seed[] = [
  {
    id: 101,
    name: 'Feira Me Gusta na Praça Garibaldi',
    description:
      '<p>A <b>Feira Me Gusta</b> volta para a Praça Garibaldi misturando arte, moda, música, gastronomia e variedades.</p><p>Traz os amigos, a família e os pets e vem curtir um domingo à sombra das árvores, ouvindo um bom som e valorizando o trabalho de artistas, artesãos e criativos.</p><p>Entrada gratuita.</p>',
    address: 'Praça Garibaldi - Cidade Baixa, Porto Alegre',
    hour: '13:00-21:00',
    days: 0,
    banner: 'TOP',
    featured: true,
    prioritized: true,
    categoryIds: [22, 40],
    tagNames: ['FEIRA DE RUA', 'AO AR LIVRE', 'GRATUITO'],
    latitude: '-30.038611',
    longitude: '-51.221944',
    seed: 'poa-feira-me-gusta',
    flagIds: [1, 3],
    instagram: 'feiramegusta',
  },
  {
    id: 102,
    name: 'Brique da Redenção',
    description:
      '<p>Todo domingo o <b>Brique da Redenção</b> toma a Av. José Bonifácio com antiquários, artesanato, gastronomia e música ao vivo.</p><p>Um dos programas mais tradicionais de Porto Alegre, de manhã até o fim da tarde.</p>',
    address: 'Av. José Bonifácio - Parque Farroupilha, Porto Alegre',
    hour: '09:00-17:00',
    days: 0,
    banner: 'TOP',
    prioritized: true,
    categoryIds: [22, 43],
    tagNames: ['FEIRA DE RUA', 'AO AR LIVRE', 'GRATUITO', 'PET FRIENDLY'],
    latitude: '-30.037778',
    longitude: '-51.219167',
    seed: 'poa-brique-redencao',
    flagIds: [1, 2, 3],
  },
  {
    id: 103,
    name: 'Pôr do Sol no Gasômetro',
    description:
      '<p>O clássico dos clássicos: o pôr do sol mais bonito da cidade, com food trucks, chimarrão e música na orla do Guaíba.</p>',
    address: 'Usina do Gasômetro - Centro Histórico, Porto Alegre',
    hour: '17:00-20:00',
    days: 0,
    daysFinal: 30,
    banner: 'TOP',
    categoryIds: [43, 44],
    tagNames: ['AO AR LIVRE', 'GRATUITO'],
    latitude: '-30.034444',
    longitude: '-51.241389',
    seed: 'poa-gasometro',
    flagIds: [1],
  },
  {
    id: 104,
    name: 'Feira Orgânica da Bom Fim',
    description:
      '<p>Produtores da região metropolitana com hortaliças, frutas, pães e queijos orgânicos certificados.</p><p>Leva tua sacola e chega cedo.</p>',
    address: 'Parque Farroupilha - Bom Fim, Porto Alegre',
    hour: '07:00-13:00',
    days: 1,
    banner: 'NORMAL',
    categoryIds: [22, 42],
    tagNames: ['FEIRA DE RUA', 'AO AR LIVRE'],
    latitude: '-30.036389',
    longitude: '-51.213611',
    seed: 'poa-feira-organica-bomfim',
  },
  {
    id: 105,
    name: 'Sarau na Praça Dom Feliciano',
    description:
      '<p>Poesia, samba de roda e microfone aberto na praça. Chega junto, traz teu instrumento.</p>',
    address: 'Praça Dom Feliciano - Cidade Baixa, Porto Alegre',
    hour: '19:00-23:00',
    days: 2,
    banner: 'NORMAL',
    categoryIds: [41, 44],
    tagNames: ['SHOW', 'GRATUITO'],
    latitude: '-30.041111',
    longitude: '-51.224722',
    seed: 'poa-sarau-praca',
    flagIds: [1],
  },
  {
    id: 106,
    name: 'Noite de Karaokê no Bar do Beto',
    description:
      '<p>Toda terça é dia de karaokê. Cerveja gelada, petiscos e coragem para pegar o microfone.</p>',
    address: 'Rua João Alfredo, 582 - Cidade Baixa, Porto Alegre',
    hour: '20:00-02:00',
    days: 3,
    banner: 'NORMAL',
    categoryIds: [41, 42],
    tagNames: ['SHOW', 'RESTAURANTE'],
    latitude: '-30.040556',
    longitude: '-51.226389',
    seed: 'poa-karaoke',
    whatsapp: '5551999999999',
  },
  {
    id: 107,
    name: '食 Food Trucks no Parcão',
    description:
      '<p>Encontro de food trucks no Parque Moinhos de Vento com opções veganas, hambúrguer artesanal e sobremesas.</p>',
    address: 'Parque Moinhos de Vento - Moinhos de Vento, Porto Alegre',
    hour: '11:00-22:00',
    days: 4,
    daysFinal: 6,
    banner: 'CENTER',
    featured: true,
    categoryIds: [42, 43],
    tagNames: ['AO AR LIVRE', 'PARA CRIANÇAS', 'PET FRIENDLY'],
    latitude: '-30.026111',
    longitude: '-51.203056',
    seed: 'poa-food-trucks',
    flagIds: [2, 3],
  },
  {
    id: 108,
    name: 'Cinema ao ar livre na Redenção',
    description:
      '<p>Sessão gratuita de cinema nacional na Redenção. Traz a canga e o repelente.</p>',
    address: 'Parque Farroupilha - Porto Alegre',
    hour: '20:30-23:00',
    days: 6,
    banner: 'NORMAL',
    categoryIds: [44, 43],
    tagNames: ['GRATUITO', 'AO AR LIVRE', 'PARA CRIANÇAS'],
    latitude: '-30.037500',
    longitude: '-51.216111',
    seed: 'poa-cinema-redencao',
    flagIds: [1, 2],
  },
  {
    id: 109,
    name: 'Cadastre o teu evento no Poa na Rua',
    description:
      '<p>Organiza uma feira, um show ou um rolê de rua? Cadastra aqui e aparece para toda a cidade.</p>',
    address: 'Porto Alegre',
    hour: '00:00-23:59',
    days: 0,
    daysFinal: 365,
    banner: 'END',
    categoryIds: [40],
    tagNames: ['GRATUITO'],
    latitude: '',
    longitude: '',
    seed: 'poa-cadastre-evento',
    site: 'https://poanarua.com.br/',
  },
];

export const events: EventItem[] = seeds.map((item) => {
  const date = iso(item.days, Number(item.hour.slice(0, 2)));
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    address: item.address,
    event_date: br(date),
    date,
    date_final: item.daysFinal !== undefined ? iso(item.daysFinal, 23) : null,
    hour: item.hour,
    featured: item.featured ?? false,
    bora: false,
    prioritized: item.prioritized ?? false,
    banner: item.banner,
    visibility: true,
    image: image(item.seed),
    image_banner: image(`${item.seed}-banner`, 1200, 800),
    gallery: [],
    categories: item.categoryIds.map(category),
    tags: item.tagNames.map(tag),
    flags: (item.flagIds ?? []).map((id) => flags.find((flag) => flag.id === id)!),
    evaluations: [],
    contacts: [
      { id: item.id * 10 + 1, type: 'site', value: item.site ?? '' },
      { id: item.id * 10 + 2, type: 'facebook', value: '' },
      { id: item.id * 10 + 3, type: 'instagram', value: item.instagram ?? '' },
      { id: item.id * 10 + 4, type: 'whatsapp', value: item.whatsapp ?? '' },
    ],
    locations: item.latitude
      ? [{ latitude: item.latitude, longitude: item.longitude }]
      : [],
    user_id: 1,
  };
});

export const evaluations: Record<number, Evaluation[]> = {
  101: [
    {
      id: 10,
      name: 'Thiana',
      avatar: null,
      comment: 'Melhor domingo da cidade. Levamos a Mia e ela amou.',
      note: 5,
      last_comment: '24/12/2024',
    },
    {
      id: 11,
      name: 'Rafael',
      avatar: null,
      comment: 'Boa música e comida boa, só faltou mais sombra.',
      note: 4,
      last_comment: '23/12/2024',
    },
  ],
  102: [
    {
      id: 12,
      name: 'Carla',
      avatar: null,
      comment: 'Clássico. Vale ir cedo para achar as melhores peças.',
      note: 5,
      last_comment: '18/11/2024',
    },
  ],
};

export const goEvent: Record<number, GoEventUser[]> = {
  101: [
    { id: 1, name: 'Thiana', avatar: null },
    { id: 2, name: 'Rafael', avatar: null },
    { id: 3, name: 'Carla', avatar: null },
  ],
  102: [{ id: 2, name: 'Rafael', avatar: null }],
};

export const demoUser: User = {
  id: 1,
  name: 'Guilherme Fraga',
  email: 'guilherme@poanarua.com.br',
  phone: '(51) 99603-3460',
  birthday: '25/09/1982',
  avatar: null,
  provider: 'EMAIL',
};

export const appUpdate: AppUpdate[] = [
  { platform: 'android', version: '2.7.1', show: false },
  { platform: 'ios', version: '2.7.1', show: false },
];

export const inAppMessage: InAppMessage = {
  id: 1,
  show: false,
  title: 'Bem-vindo de volta ao Poa na Rua',
  link: 'https://poanarua.com.br/',
};
