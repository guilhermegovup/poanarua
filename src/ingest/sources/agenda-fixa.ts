import type { RawEvent, Source } from "../types";
import { instantAt, occurrences, type Recurrence } from "../recurrence";

/**
 * Agenda fixa de Porto Alegre.
 *
 * Esta fonte não baixa nada: ela gera. O Brique acontece todo domingo e a
 * feira ecológica todo sábado — não são notícia, então não aparecem em
 * listagem de agenda nenhuma. Sem isso, um sábado de manhã na plataforma fica
 * vazio mesmo com todos os coletores funcionando.
 *
 * Cada ocorrência vira um evento datado, com chave de dedupe própria (nome +
 * dia), então rodar a coleta duas vezes não duplica nada e o webadmin edita
 * cada data como edita qualquer outro evento — dá para cancelar o Brique de
 * um domingo específico sem mexer na regra.
 *
 * Para somar uma feira: acrescente um objeto em `AGENDA_FIXA`. Confirme dia e
 * horário antes — este catálogo só tem o que é tradicional e estável.
 */

/**
 * Quantos dias à frente gerar.
 *
 * Três semanas mantêm o calendário cheio mesmo se a coleta rodar só de vez em
 * quando, sem encher a home com a mesma feira dez vezes.
 */
const HORIZON_DAYS = 21;

const HOMEPAGE = "https://poanarua.com.br";

export interface FixedEvent {
  name: string;
  description: string;
  address: string;
  /** Faixa de horário como aparece para quem lê: "09:00-17:00". */
  hour: string;
  /** Início, para ordenar o dia. Sai da faixa acima. */
  startHour: string;
  latitude?: string;
  longitude?: string;
  /** Pistas para a inferência de categoria e tag. */
  keywords: string[];
  offers?: string;
  recurrence: Recurrence;
}

export const AGENDA_FIXA: FixedEvent[] = [
  {
    name: "Brique da Redenção",
    description:
      "<p>Todo domingo o <b>Brique da Redenção</b> toma a Av. José Bonifácio com antiquários, artesanato, gastronomia e música ao vivo.</p><p>Um dos programas mais tradicionais de Porto Alegre, de manhã até o fim da tarde. Vai de família, vai com o cachorro, vai sem pressa.</p>",
    address: "Av. José Bonifácio - Parque Farroupilha, Porto Alegre",
    hour: "09:00-17:00",
    startHour: "09:00",
    latitude: "-30.037778",
    longitude: "-51.219167",
    keywords: [
      "artesanato",
      "antiguidades",
      "feira",
      "música",
      "para toda a família",
      "ar livre",
      "parque",
      "pet",
    ],
    offers: "Gratuito",
    recurrence: { kind: "semanal", weekdays: [0] },
  },
  {
    name: "Feira Ecológica da Redenção",
    description:
      "<p>Sábado de manhã, produtores da região metropolitana ocupam a Av. José Bonifácio com hortaliças, frutas, pães e queijos <b>orgânicos certificados</b>.</p><p>É a feira ecológica mais antiga do país. Leva tua sacola e chega cedo — o que é bom acaba.</p>",
    address: "Av. José Bonifácio - Parque Farroupilha, Porto Alegre",
    hour: "07:00-13:00",
    startHour: "07:00",
    latitude: "-30.036389",
    longitude: "-51.213611",
    keywords: ["orgânico", "agroecológico", "feira", "produtor rural", "ar livre", "parque"],
    offers: "Gratuito",
    recurrence: { kind: "semanal", weekdays: [6] },
  },
];

/** Expande o catálogo nas datas em que cada regra acontece. */
export function generateAgenda(today: Date, catalog = AGENDA_FIXA): RawEvent[] {
  const events: RawEvent[] = [];

  for (const fixed of catalog) {
    for (const day of occurrences(fixed.recurrence, today, HORIZON_DAYS)) {
      const event: RawEvent = {
        name: fixed.name,
        description: fixed.description,
        address: fixed.address,
        startDate: instantAt(day, fixed.startHour),
        hour: fixed.hour,
        keywords: fixed.keywords,
        // O id externo amarra a ocorrência à regra que a gerou.
        externalId: `${slug(fixed.name)}-${day}`,
      };

      if (fixed.latitude) event.latitude = fixed.latitude;
      if (fixed.longitude) event.longitude = fixed.longitude;
      if (fixed.offers) event.offers = fixed.offers;

      events.push(event);
    }
  }

  return events;
}

function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const agendaFixa: Source = {
  id: "agenda-fixa",
  name: "Agenda fixa de Porto Alegre",
  homepage: HOMEPAGE,
  entrypoints: [],
  generate: generateAgenda,
  extract: () => [],
};
