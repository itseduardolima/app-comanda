import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderListFilter } from '@/api/orders';
import { OrderCard } from '@/components/order-card/order-card';
import { Button } from '@/components/ui/button/button';
import { Chip } from '@/components/ui/chip/chip';
import { Text } from '@/components/ui/text/text';
import { useNow } from '@/hooks/use-now';
import { useOrders } from '@/hooks/use-orders';
import { t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';

const FILTERS: { key: OrderListFilter; labelKey: 'orders.filterOpen' | 'orders.filterPaid' | 'orders.filterAll' }[] = [
  { key: 'open', labelKey: 'orders.filterOpen' },
  { key: 'paid', labelKey: 'orders.filterPaid' },
  { key: 'all', labelKey: 'orders.filterAll' },
];

const EMPTY_KEYS = {
  open: 'orders.emptyOpen',
  paid: 'orders.emptyPaid',
  all: 'orders.emptyAll',
} as const;

/** Screen 01 — Comandas with Abertas/Pagas/Todas filters (HU-04/HU-40). */
export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<OrderListFilter>('open');
  const { orders, loading, pendingSyncCount, refresh } = useOrders(filter);
  const now = useNow();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <Text variant="title">{t('orders.title')}</Text>
        {pendingSyncCount > 0 ? (
          <View
            style={{
              backgroundColor: theme.colors.warningSoft,
              borderRadius: theme.radii.md,
              padding: theme.spacing.sm,
            }}
          >
            <Text variant="caption">{t('common.offlineBanner')}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {FILTERS.map(({ key, labelKey }) => (
            <Chip key={key} label={t(labelKey)} selected={filter === key} onPress={() => setFilter(key)} />
          ))}
        </View>
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              now={now}
              onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
          ListEmptyComponent={
            loading ? null : (
              <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
                <Text variant="body" color="muted" align="center">
                  {t(EMPTY_KEYS[filter])}
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        />
        <Button onPress={() => router.push('/orders/new')} size="lg">
          {t('orders.newOrder')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
