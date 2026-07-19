import { Text as RNText, View } from 'react-native';
import { formatCents, t, tCount, TranslationKey } from '../../i18n';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus, Order, orderTotal } from '../../types/order';
import { Badge } from '../ui/badge/badge';
import { Card } from '../ui/card/card';
import { Text } from '../ui/text/text';
import { useStyles } from './order-card.styles';

interface Props {
  order: Order;
  now: Date;
  onPress: () => void;
}

/** Bottom-row status label per prototype ("Pedido pronto", "Em preparo"…). */
const CARD_STATUS_KEYS: Record<KitchenStatus, TranslationKey> = {
  queued: 'kitchen.statusQueued',
  preparing: 'kitchen.statusPreparing',
  ready: 'orders.cardReady',
  delivered: 'kitchen.statusDelivered',
};

function orderTitle(order: Order): string {
  if (order.type === 'dine_in') {
    return order.table
      ? `${t('orders.table')} ${String(order.table.number).padStart(2, '0')}`
      : t('orders.table');
  }
  return order.type === 'counter' ? t('orders.counter') : t('orders.delivery');
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

/** Card of screen 01 — Comandas list (HU-04, prototype layout). */
export function OrderCard({ order, now, onPress }: Props) {
  const styles = useStyles();
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60_000),
  );
  const elapsed = minutes === 0 ? t('orders.justNow') : t('orders.elapsedMinutes', { count: minutes });
  const subtitleParts = [
    order.customerName || null,
    tCount('orders.itemsCount', order.items.length),
    elapsed,
  ].filter(Boolean);
  const bottleneck = kitchenBottleneck(order);
  const bottleneckDone = bottleneck === 'ready' || bottleneck === 'delivered';

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="subtitle" weight="bold">
            {orderTitle(order)}
          </Text>
          <Text variant="caption" color="muted">
            {subtitleParts.join(' · ')}
          </Text>
        </View>
        <Badge variant={order.paymentStatus === 'paid' ? 'paid' : 'unpaid'} />
      </View>
      {order.pendingSync ? (
        <View style={styles.pendingRow}>
          <Text variant="caption" color="muted">
            ⟳ {t('common.pendingSync')}
          </Text>
        </View>
      ) : null}
      <View style={styles.footer}>
        {bottleneck ? (
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, bottleneckDone ? styles.dotSuccess : styles.dotPrimary]} />
            <RNText style={[styles.statusText, bottleneckDone && styles.statusTextSuccess]}>
              {t(CARD_STATUS_KEYS[bottleneck])}
            </RNText>
          </View>
        ) : (
          <View />
        )}
        <Text variant="subtitle" weight="bold">
          {formatCents(orderTotal(order))}
        </Text>
      </View>
    </Card>
  );
}
