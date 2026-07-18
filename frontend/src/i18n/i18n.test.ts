import { formatCents, t, tCount } from './index';

describe('i18n', () => {
  it('resolves nested translation keys', () => {
    expect(t('orders.title')).toBe('Comandas');
    expect(t('kitchen.statusQueued')).toBe('Na fila');
  });

  it('interpolates params', () => {
    expect(t('orders.elapsedMinutes', { count: 12 })).toBe('há 12 min');
    expect(t('kitchen.ticket', { number: 1404 })).toBe('Ticket #1404');
  });

  it('pluralizes item counts', () => {
    expect(tCount('orders.itemsCount', 1)).toBe('1 item');
    expect(tCount('orders.itemsCount', 3)).toBe('3 itens');
  });

  it('formats cents as BRL', () => {
    expect(formatCents(9490)).toMatch(/9[.,]?490|94,90/);
    expect(formatCents(9490)).toContain('94,90');
  });
});
