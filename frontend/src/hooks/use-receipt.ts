import { useState } from 'react';
import { formatCents, t } from '../i18n';
import { ThemeTokens } from '../theme/tokens';
import { Order, OrderItemModifiers, orderTotal } from '../types/order';

/**
 * Digital receipt (HU-47): a PDF built locally from already-synced data (works
 * offline) and handed to the native share sheet (WhatsApp/e-mail — no paid
 * messaging API). Contains NO payment data: it only records that the order
 * was marked as paid.
 */

function describeModifiers(modifiers?: OrderItemModifiers | null): string {
  if (!modifiers) {
    return '';
  }
  const parts: string[] = [];
  if (modifiers.point) {
    const points = {
      mal_passado: t('customize.pointRare'),
      ao_ponto: t('customize.pointMedium'),
      bem_passado: t('customize.pointWellDone'),
    } as const;
    parts.push(points[modifiers.point]);
  }
  if (modifiers.remove?.length) {
    parts.push(modifiers.remove.map((name) => `sem ${name}`).join(', '));
  }
  if (modifiers.add?.length) {
    parts.push(modifiers.add.map((name) => `+ ${name}`).join(', '));
  }
  if (modifiers.note) {
    parts.push(modifiers.note);
  }
  return parts.join(' · ');
}

export function buildReceiptHtml(order: Order, brand: ThemeTokens['brand']): string {
  const title =
    order.type === 'dine_in'
      ? `${t('orders.table')} ${String(order.table?.number ?? '').padStart(2, '0')}`
      : order.type === 'counter'
        ? t('orders.counter')
        : t('orders.delivery');
  const closedAt = order.closedAt ? new Date(order.closedAt) : new Date(order.createdAt);
  const rows = order.items
    .map((item) => {
      const details = describeModifiers(item.modifiers);
      return `<tr>
        <td>${item.quantity}x ${item.menuItem?.name ?? ''}${details ? `<br/><small>${details}</small>` : ''}</td>
        <td class="right">${formatCents(item.quantity * item.finalPrice)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
  <style>
    body { font-family: -apple-system, Roboto, sans-serif; padding: 24px; color: #1C1917; }
    h1 { font-size: 20px; margin: 0; } h2 { font-size: 14px; font-weight: 400; color: #78716C; margin: 4px 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    td { padding: 6px 0; border-bottom: 1px solid #E7E5E4; vertical-align: top; }
    small { color: #78716C; }
    .right { text-align: right; white-space: nowrap; }
    .total td { font-weight: 700; border-bottom: none; padding-top: 12px; }
    .footer { margin-top: 24px; font-size: 12px; color: #78716C; }
  </style></head><body>
  <h1>${brand.name}</h1>
  <h2>${title}${order.customerName ? ` · ${order.customerName}` : ''} — ${closedAt.toLocaleString('pt-BR')}</h2>
  <table>
    ${rows}
    <tr class="total"><td>${t('orderDetail.total')}</td><td class="right">${formatCents(orderTotal(order))}</td></tr>
  </table>
  <p class="footer">${t('receipt.paidNotice')}${order.closedBy ? ` — ${t('orderDetail.closedBy', { name: order.closedBy.name })}` : ''}<br/>${t('receipt.fiscalDisclaimer')}</p>
  </body></html>`;
}

export function useReceipt(brand: ThemeTokens['brand']) {
  const [generating, setGenerating] = useState(false);

  const share = async (order: Order): Promise<void> => {
    setGenerating(true);
    try {
      // Lazy imports: native-only modules stay out of web/test bundles.
      const print = await import('expo-print');
      const sharing = await import('expo-sharing');
      const { uri } = await print.printToFileAsync({ html: buildReceiptHtml(order, brand) });
      if (await sharing.isAvailableAsync()) {
        await sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('receipt.shareTitle'),
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  return { generating, share };
}
