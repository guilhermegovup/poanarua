import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/pt-br';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.locale('pt-br');

export { dayjs };

/** 'DD/MM/YYYY' -> ISO, formato aceito pelo POST /event. */
export function formatDate(value: string): string {
  if (!value) return '';
  const parsed = dayjs(value, 'DD/MM/YYYY', true);
  return parsed.isValid() ? parsed.toISOString() : '';
}

export function toBrDate(value?: string | null): string {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '';
}

/** Um evento "acontece hoje" se cai na data ou se hoje está dentro do período. */
export function isHappeningToday(event: {
  date: string;
  date_final?: string | null;
}): boolean {
  const today = dayjs();
  if (event.date_final) {
    return today.isBetween(dayjs(event.date), dayjs(event.date_final), 'day', '[]');
  }
  return dayjs(event.date).isSame(today, 'day');
}

export function isValidBirthday(value: string): boolean {
  const parsed = dayjs(value, 'DD/MM/YYYY', true);
  return parsed.isValid() && parsed.isBefore(dayjs());
}
