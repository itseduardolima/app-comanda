import { ptBR } from './pt-BR';

/** Dot-separated paths of every leaf string in the translation tree. */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Paths<typeof ptBR>;

/**
 * Resolves a translation key ("orders.title") and interpolates {{params}}.
 * pt-BR only in the MVP, but every screen already goes through here so no
 * UI string is ever hardcoded (.specs/05-padroes-de-codigo.md).
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const raw = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], ptBR);
  let text = typeof raw === 'string' ? raw : key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{{${name}}}`, String(value));
    }
  }
  return text;
}

/** Plural helper for the few keys shaped as { one, other }. */
export function tCount(key: 'orders.itemsCount', count: number): string {
  const forms = ptBR.orders.itemsCount;
  const template = count === 1 ? forms.one : forms.other;
  return template.replaceAll('{{count}}', String(count));
}

/** Formats integer cents as BRL for display (prices are cents end-to-end). */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
