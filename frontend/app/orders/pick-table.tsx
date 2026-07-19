import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { useOrderActions } from '@/hooks/use-orders';
import { useTables } from '@/hooks/use-tables';
import { t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';
import { Table } from '@/types/table';

/**
 * Screen 1B — Escolher mesa (HU-06). Free tables open a new order directly;
 * occupied tables reveal their open orders (split bills) and still allow
 * opening another order on the same table.
 */
export default function PickTableScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { customerName } = useLocalSearchParams<{ customerName?: string }>();
  const { tables, tableOrders, loading, loadError, reload, loadTableOrders } = useTables();
  const { createOrderLocal } = useOrderActions();
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);

  const openOrderHere = (table: Table) => {
    const orderId = createOrderLocal({
      type: 'dine_in',
      table,
      customerName: customerName || undefined,
    });
    router.replace({ pathname: '/(tabs)/menu', params: { orderId } });
  };

  const handlePress = (table: Table) => {
    if (table.status === 'free') {
      openOrderHere(table);
      return;
    }
    // Occupied: expand to show this table's open orders (multi-comanda).
    setExpandedTableId((current) => (current === table.id ? null : table.id));
    void loadTableOrders(table.id);
  };

  const expandedTable = tables.find((table) => table.id === expandedTableId);
  const expandedOrders = expandedTableId ? (tableOrders[expandedTableId] ?? []) : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, gap: theme.spacing.md }}>
      {loadError ? (
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <Text variant="body" color="muted">
            {t('pickTable.loadError')}
          </Text>
          <Button variant="secondary" size="sm" onPress={() => void reload()}>
            {t('common.retry')}
          </Button>
        </View>
      ) : null}
      <FlatList
        data={tables}
        keyExtractor={(table) => table.id}
        numColumns={3}
        columnWrapperStyle={{ gap: theme.spacing.sm }}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} />}
        renderItem={({ item: table }) => {
          const free = table.status === 'free';
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => handlePress(table)}
              style={({ pressed }) => ({
                flex: 1,
                aspectRatio: 1,
                borderRadius: theme.radii.lg,
                borderWidth: 2,
                borderColor: free ? theme.colors.success : theme.colors.warning,
                backgroundColor: free
                  ? pressed
                    ? theme.colors.successSoft
                    : theme.colors.surface
                  : theme.colors.warningSoft,
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.xs,
              })}
            >
              <Text variant="subtitle">{String(table.number).padStart(2, '0')}</Text>
              <Text variant="caption" color={free ? 'success' : 'muted'}>
                {free ? t('pickTable.free') : t('pickTable.occupied')}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          expandedTable ? (
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
              <Text variant="subtitle">
                {t('pickTable.occupiedOrdersTitle', { number: String(expandedTable.number).padStart(2, '0') })}
              </Text>
              {expandedOrders.map((order) => (
                <Card
                  key={order.id}
                  onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="body">{order.customerName || t('orderDetail.title')}</Text>
                    <Text variant="caption" color="muted">
                      {order.items.length > 0 ? `${order.items.length}x` : ''}
                    </Text>
                  </View>
                </Card>
              ))}
              <Button variant="secondary" onPress={() => openOrderHere(expandedTable)}>
                {t('pickTable.openNewHere')}
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
}
