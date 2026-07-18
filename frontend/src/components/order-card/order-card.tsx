import { View } from 'react-native';
import { t, tCount } from '../../i18n';
import { useTheme } from '../../theme/theme-provider';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus, Order } from '../../types/order';
import { Badge, BadgeVariant } from '../ui/badge/badge';
import { Card } from '../ui/card/card';
import { Text } from '../ui/text/text';

interface Props {
  order: Order;
  now: Date;
  onPress: () => void;
}

function orderTitle(order: Order): string {
  if (order.type === 'dine_in') {
    const table = order.table ? `${t('orders.table')} ${String(order.table.number).padStart(2, '0')}` : t('orders.table');
    return order.customerName ? `${table} · ${order.customerName}` : table;
  }
  const typeLabel = order.type === 'counter' ? t('orders.counter') : t('orders.delivery');
  return order.customerName ? `${typeLabel} · ${order.customerName}` : typeLabel;
}

/** Least-advanced kitchen status across items — the order's bottleneck. */
function kitchenBottleneck(order: Order): KitchenStatus | null {
  if (order.items.length === 0) {
    return null;
  }
  let minIndex = KITCHEN_STATUS_SEQUENCE.length - 1;
  for (const item of order.items) {
    minIndex = Math.min(minIndex, KITCHEN_STATUS_SEQUENCE.indexOf(item.kitchenStatus));
  }
  return KITCHEN_STATUS_SEQUENCE[minIndex];
}

/** Card of screen 01 — Comandas list (HU-04). */
export function OrderCard({ order, now, onPress }: Props) {
  const theme = useTheme();
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60_000),
  );
  const elapsed = minutes === 0 ? t('orders.justNow') : t('orders.elapsedMinutes', { count: minutes });
  const bottleneck = kitchenBottleneck(order);

  return (
    <Card onPress={onPress}>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subtitle">{orderTitle(order)}</Text>
          <Badge variant={order.paymentStatus === 'paid' ? 'paid' : 'unpaid'} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text variant="caption" color="muted">
            {tCount('orders.itemsCount', order.items.length)} · {elapsed}
          </Text>
          {order.pendingSync ? (
            <Text variant="caption" color="muted">
              ⟳ {t('common.pendingSync')}
            </Text>
          ) : null}
        </View>
        {bottleneck ? <Badge variant={bottleneck as BadgeVariant} /> : null}
      </View>
    </Card>
  );
}
