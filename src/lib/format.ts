import type { EventItem } from "@/data/types";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const pad = (value: number) => String(value).padStart(2, "0");

export function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** "dom, 12 out" — formato curto usado nos cards. */
export function formatShortDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "";
  const weekday = WEEKDAYS[date.getDay()] ?? "";
  return `${weekday.slice(0, 3)}, ${date.getDate()} ${MONTHS[date.getMonth()] ?? ""}`;
}

/** "quinta-feira, 12 de outubro" — usado na página do evento. */
export function formatLongDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "";
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${WEEKDAYS[date.getDay()] ?? ""}, ${date.getDate()} de ${month}`;
}

/** "18:00-24:00" vira "18h às 24h". */
export function formatHour(hour?: string): string {
  if (!hour) return "";
  const [start, end] = hour.split("-").map((part) => part.trim());
  if (!start) return "";
  const short = (value: string) => value.replace(/:00$/, "h").replace(":", "h");
  if (!end) return short(start);
  return `${short(start)} às ${short(end)}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Acontece hoje: cai na data ou hoje está dentro do período do evento. */
export function isHappeningToday(event: EventItem, today = new Date()): boolean {
  const start = toDate(event.date);
  if (!start) return false;

  const end = toDate(event.date_final);
  if (end) {
    const from = new Date(start).setHours(0, 0, 0, 0);
    const to = new Date(end).setHours(23, 59, 59, 999);
    return today.getTime() >= from && today.getTime() <= to;
  }

  return sameDay(start, today);
}

export function isUpcoming(event: EventItem, today = new Date()): boolean {
  const end = toDate(event.date_final) ?? toDate(event.date);
  if (!end) return false;
  return new Date(end).setHours(23, 59, 59, 999) >= today.getTime();
}

/** Ordena por data, com os priorizados na frente dentro do mesmo dia. */
export function byDate(a: EventItem, b: EventItem): number {
  const dateA = toDate(a.date)?.getTime() ?? 0;
  const dateB = toDate(b.date)?.getTime() ?? 0;
  if (dateA !== dateB) return dateA - dateB;
  return Number(b.prioritized) - Number(a.prioritized);
}

export function initials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
