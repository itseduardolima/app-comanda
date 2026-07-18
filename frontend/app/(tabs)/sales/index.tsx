import { FlatList, View } from 'react-native';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { useOrders } from '@/hooks/use-orders';
import { formatCents, t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';
import { orderTotal } from '@/types/order';

/** Sales tab — today's paid orders summary (simple MVP view). */
export default function SalesScreen() {
  const theme = useTheme();
  const { orders } = useOrders('paid');

  const today = new Date();
  const isToday = (iso?: string | null) => {
    if (!iso) {
      return false;
    }
    const date = new Date(iso);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const paidToday = orders.filter((order) => isToday(order.closedAt));
  const revenue = paidToday.reduce((total, order) => total + orderTotal(order), 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, gap: theme.spacing.md }}>
      <Text variant="subtitle">{t('sales.todayTitle')}</Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="muted">
            {t('sales.paidOrders')}
          </Text>
          <Text variant="title">{paidToday.length}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="muted">
            {t('sales.totalRevenue')}
          </Text>
          <Text variant="title">{formatCents(revenue)}</Text>
        </Card>
      </View>
      <FlatList
        data={paidToday}
        keyExtractor={(order) => order.id}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="body">
                {item.table
                  ? `${t('orders.table')} ${String(item.table.number).padStart(2, '0')}`
                  : item.type === 'counter'
                    ? t('orders.counter')
                    : t('orders.delivery')}
                {item.customerName ? ` · ${item.customerName}` : ''}
              </Text>
              <Text variant="body" color="success">
                {formatCents(orderTotal(item))}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text variant="body" color="muted" align="center">
            {t('sales.empty')}
          </Text>
        }
      />
    </View>
  );
}
