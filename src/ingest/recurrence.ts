/**
 * Recorrência de agenda fixa.
 *
 * O que enche um sábado em Porto Alegre quase nunca está num portal de
 * agenda: o Brique acontece todo domingo desde 1978 e ninguém publica isso
 * como "evento da semana". São regras, não notícias — então em vez de raspar,
 * a gente expande.
 *
 * Tudo aqui trabalha com o dia do calendário de Porto Alegre (UTC-03:00, sem
 * horário de verão desde 2019). Contar dias em UTC evita o erro clássico de
 * somar 24h e cair no dia anterior; o fuso entra só na hora de montar o
 * instante final.
 */

/** Minutos de diferença de Porto Alegre para o UTC. */
const POA_OFFSET_MINUTES = -180;
const POA_OFFSET_ISO = "-03:00";
const DAY_MS = 86_400_000;

export type Recurrence =
  /** Toda semana, nos dias da semana listados (0 = domingo). */
  | { kind: "semanal"; weekdays: number[] }
  /**
   * Toda N-ésima ocorrência do dia da semana no mês. `nth: [1, 3]` com
   * `weekdays: [6]` é "primeiro e terceiro sábado"; `-1` é o último.
   */
  | { kind: "mensal"; weekdays: number[]; nth: number[] };

/** Meia-noite do dia de Porto Alegre a que o instante pertence, em UTC. */
function poaMidnightUtc(date: Date): number {
  const shifted = new Date(date.getTime() + POA_OFFSET_MINUTES * 60_000);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

function isoDay(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/** Em que semana do mês cai o dia: 1 para o primeiro, 2 para o segundo... */
function weekOfMonth(timestamp: number): number {
  return Math.floor((new Date(timestamp).getUTCDate() - 1) / 7) + 1;
}

/** Verdadeiro quando não existe outro mesmo dia da semana adiante no mês. */
function isLastOfMonth(timestamp: number): boolean {
  const date = new Date(timestamp);
  const next = new Date(timestamp + 7 * DAY_MS);
  return next.getUTCMonth() !== date.getUTCMonth();
}

export function matches(rule: Recurrence, timestamp: number): boolean {
  const weekday = new Date(timestamp).getUTCDay();
  if (!rule.weekdays.includes(weekday)) return false;
  if (rule.kind === "semanal") return true;

  const nth = weekOfMonth(timestamp);
  return rule.nth.some((wanted) => (wanted === -1 ? isLastOfMonth(timestamp) : wanted === nth));
}

/**
 * Os dias em que a regra acontece, de hoje até `days` dias à frente.
 * Devolve `YYYY-MM-DD` — data pura, sem hora, para o fuso não vazar.
 */
export function occurrences(rule: Recurrence, from: Date, days: number): string[] {
  if (days < 0) return [];

  const start = poaMidnightUtc(from);
  const found: string[] = [];

  for (let offset = 0; offset <= days; offset += 1) {
    const timestamp = start + offset * DAY_MS;
    if (matches(rule, timestamp)) found.push(isoDay(timestamp));
  }

  return found;
}

/**
 * Junta dia e hora num instante com o fuso explícito.
 *
 * Escrever `-03:00` na string é o que garante que 9h da manhã do Brique seja
 * 9h em Porto Alegre, e não 9h do servidor onde a coleta rodou.
 */
export function instantAt(day: string, hour: string): string {
  const [hours = "00", minutes = "00"] = hour.split(":");
  return `${day}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00${POA_OFFSET_ISO}`;
}
