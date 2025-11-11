import { parseISO, format } from 'date-fns';

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
    const date = parseISO(dateStr);
    return format(date, 'd');
}

export function getMonthName(date: Date): string {
    return format(date, 'MMMM yyyy');
}