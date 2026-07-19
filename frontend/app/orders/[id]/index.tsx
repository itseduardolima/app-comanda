import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { useKitchenSocket } from '@/hooks/use-kitchen-socket';
import { useOrder, useOrderActions } from '@/hooks/use-orders';
import { useReceipt } from '@/hooks/use-receipt';
import { formatCents, t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';
import { ApiError, NetworkError } from '@/types/errors';
import { isLocalId, OrderItem, orderTotal } from '@/types/order';

function modifiersSummary(item: OrderItem): string | null {
  const modifiers = item.modifiers;
  if (!modifiers) {
    return null;
  }
  const parts: string[] = [];
  if (modifiers.point) {
    const pointLabels = {
      mal_passado: t('customize.pointRare'),
      ao_ponto: t('customize.pointMedium'),
      bem_passado: t('customize.pointWellDone'),
    } as const;
    parts.push(pointLabels[modifiers.point]);
  }
  if (modifiers.remove?.length) {
    parts.push(modifiers.remove.map((name) => `− ${name}`).join(', '));
  }
  if (modifiers.add?.length) {
    parts.push(modifiers.add.map((name) => `+ ${name}`).join(', '));
  }
  if (modifiers.note) {
    parts.push(`"${modifiers.note}"`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Screen 04 — order detail: items with per-item kitchen status, total,
 * add items, send to kitchen and close order (HU-09/HU-39/HU-42). */
export default function OrderDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order } = useOrder(id);
  const { removeItemLocal, sendToKitchen, closeOrder, resolveId } = useOrderActions();
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const { generating, share } = useReceipt(theme.brand);
  useKitchenSocket(id, order?.tableId ?? undefined);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" color="muted">
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  const total = orderTotal(order);
  const title = order.table
    ? `${t('orders.table')} ${String(order.table.number).padStart(2, '0')}${order.customerName ? ` · ${order.customerName}` : ''}`
    : `${order.type === 'counter' ? t('orders.counter') : t('orders.delivery')}${order.customerName ? ` · ${order.customerName}` : ''}`;
  const hasUnsentItems = order.items.some((item) => !item.kitchenTicketId);
  const hasSentItems = order.items.some((item) => Boolean(item.kitchenTicketId));
  const isPaid = order.paymentStatus === 'paid';

  const handleSend = async () => {
    // A still-unsynced order cannot reach the kitchen — the ticket must be
    // real before the cooks start (send-to-kitchen is online-only by design).
    if (isLocalId(resolveId(order.id))) {
      Alert.alert(t('orderDetail.sendError'), t('common.networkError'));
      return;
    }
    setSending(true);
    try {
      const ticket = await sendToKitchen(order.id);
      Alert.alert(t('orderDetail.sendSuccess', { number: ticket.number }));
      router.push({ pathname: '/orders/[id]/kitchen', params: { id: order.id } });
    } catch (error) {
      Alert.alert(
        t('orderDetail.sendError'),
        error instanceof ApiError ? error.message : t('common.networkError'),
      );
    } finally {
      setSending(false);
    }
  };

  // Explicit confirmation before flipping to paid — manual action with no
  // reconciliation to undo mistakes (HU-39).
  const handleClose = () => {
    Alert.alert(
      t('orderDetail.closeConfirmTitle'),
      t('orderDetail.closeConfirmMessage', { total: formatCents(total) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            void (async () => {
              setClosing(true);
              try {
                await closeOrder(order.id);
              } catch (error) {
                Alert.alert(
                  t('orderDetail.closeError'),
                  error instanceof NetworkError ? t('common.networkError') : error instanceof ApiError ? error.message : t('common.error'),
                );
              } finally {
                setClosing(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subtitle">{title}</Text>
          <Badge variant={isPaid ? 'paid' : 'unpaid'} />
        </View>
        {order.pendingSync ? (
          <Text variant="caption" color="muted">
            ⟳ {t('common.pendingSync')}
          </Text>
        ) : null}
        {isPaid && order.closedBy ? (
          <Text variant="caption" color="muted">
            {t('orderDetail.closedBy', { name: order.closedBy.name })}
          </Text>
        ) : null}

        {order.items.length === 0 ? (
          <Card>
            <Text variant="body" color="muted" align="center">
              {t('orderDetail.emptyItems')}
            </Text>
          </Card>
        ) : (
          order.items.map((item) => {
            const summary = modifiersSummary(item);
            const editable = !item.kitchenTicketId && !isPaid;
            return (
              <Card key={item.id}>
                <View style={{ gap: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexShrink: 1 }}>
                      <Text variant="body">
                        {t('orderDetail.quantityShort', { count: item.quantity })} {item.menuItem?.name ?? ''}
                      </Text>
                      {summary ? (
                        <Text variant="caption" color="muted">
                          {summary}
                        </Text>
                      ) : null}
                    </View>
                    <Text variant="body">{formatCents(item.quantity * item.finalPrice)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                    <Badge variant={item.kitchenStatus} />
                    {isLocalId(item.id) ? (
                      <Text variant="caption" color="muted">
                        ⟳ {t('common.pendingSync')}
                      </Text>
                    ) : null}
                  </View>
                  {editable ? (
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() =>
                            router.push({
                              pathname: '/orders/[id]/customize',
                              params: { id: order.id, menuItemId: item.menuItemId, itemId: item.id },
                            })
                          }
                        >
                          {t('orderDetail.editItem')}
                        </Button>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button variant="danger" size="sm" onPress={() => removeItemLocal(order.id, item.id)}>
                          {t('orderDetail.removeItem')}
                        </Button>
                      </View>
                    </View>
                  ) : !isPaid ? (
                    <Text variant="caption" color="muted">
                      {t('orderDetail.sentItemLocked')}
                    </Text>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="subtitle">{t('orderDetail.total')}</Text>
            <Text variant="subtitle" color="primary">
              {formatCents(total)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        {!isPaid ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                onPress={() => router.push({ pathname: '/(tabs)/menu', params: { orderId: order.id } })}
              >
                {t('orderDetail.addItems')}
              </Button>
            </View>
            {hasUnsentItems && order.items.length > 0 ? (
              <View style={{ flex: 1 }}>
                <Button onPress={() => void handleSend()} loading={sending}>
                  {t('orderDetail.sendToKitchen')}
                </Button>
              </View>
            ) : hasSentItems ? (
              <View style={{ flex: 1 }}>
                <Button
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/orders/[id]/kitchen', params: { id: order.id } })}
                >
                  {t('orderDetail.viewKitchen')}
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}
        {hasSentItems && hasUnsentItems && !isPaid ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push({ pathname: '/orders/[id]/kitchen', params: { id: order.id } })}
          >
            {t('orderDetail.viewKitchen')}
          </Button>
        ) : null}
        {!isPaid && order.items.length > 0 ? (
          <Button variant="primary" size="lg" onPress={handleClose} loading={closing}>
            {t('orderDetail.closeOrder')} · {formatCents(total)}
          </Button>
        ) : null}
        {isPaid ? (
          <Button
            variant="secondary"
            onPress={() => {
              void share(order).catch(() => Alert.alert(t('receipt.error')));
            }}
            loading={generating}
          >
            {t('receipt.generate')}
          </Button>
        ) : null}
      </View>
    </View>
  );
}
