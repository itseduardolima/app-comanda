import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { ApiError } from '@/api/client';
import { KitchenStatusStepper } from '@/components/kitchen-status-stepper/kitchen-status-stepper';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { useNow, elapsedMinutes } from '@/hooks/use-now';
import { useOrder } from '@/hooks/use-orders';
import { t } from '@/i18n';
import { useOrdersStore } from '@/store/orders.store';
import { useTheme } from '@/theme/theme-provider';
import { Chip } from '@/components/ui/chip/chip';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus, OrderItem } from '@/types/order';
import { useKitchenSocket } from '@/ws/use-kitchen-socket';

const STAGE_LABEL_KEYS = {
  queued: 'kitchen.stepSent',
  preparing: 'kitchen.stepPreparing',
  ready: 'kitchen.stepReady',
  delivered: 'kitchen.stepDelivered',
} as const;

const STAGE_EMPTY_KEYS = {
  queued: 'kitchen.queuedEmpty',
  preparing: 'kitchen.preparingEmpty',
  ready: 'kitchen.readyEmpty',
  delivered: 'kitchen.deliveredEmpty',
} as const;

/** Least-advanced status among sent items — drives the stepper (4A). */
function bottleneck(items: OrderItem[]): KitchenStatus {
  const sent = items.filter((item) => item.kitchenTicketId);
  if (sent.length === 0) {
    return 'queued';
  }
  let minIndex = KITCHEN_STATUS_SEQUENCE.length - 1;
  for (const item of sent) {
    minIndex = Math.min(minIndex, KITCHEN_STATUS_SEQUENCE.indexOf(item.kitchenStatus));
  }
  return KITCHEN_STATUS_SEQUENCE[minIndex];
}

/**
 * Screens 4A–4D in one route, segmented by kitchen stage. Realtime via the
 * order room (HU-32); the socket layer resyncs the REST baseline on
 * reconnect (HU-33).
 */
export default function KitchenScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order } = useOrder(id);
  const { connected } = useKitchenSocket(id);
  const loadTickets = useOrdersStore((state) => state.loadTickets);
  const markDelivered = useOrdersStore((state) => state.markDelivered);
  const resolveId = useOrdersStore((state) => state.resolveId);
  const tickets = useOrdersStore((state) => state.tickets[resolveId(id)] ?? []);
  const now = useNow(15_000);
  const [stage, setStage] = useState<KitchenStatus | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    void loadTickets(id);
  }, [id, loadTickets]);

  const sentItems = useMemo(
    () => (order?.items ?? []).filter((item) => item.kitchenTicketId),
    [order],
  );
  const currentBottleneck = bottleneck(order?.items ?? []);
  const activeStage = stage ?? currentBottleneck;
  const stageItems = sentItems.filter((item) => item.kitchenStatus === activeStage);
  const latestTicket = tickets.length > 0 ? tickets[tickets.length - 1] : undefined;
  const isUnpaid = order?.paymentStatus === 'unpaid';

  const handleMarkDelivered = async (item: OrderItem) => {
    // No optimistic flip: state only changes after server confirmation (HU-36).
    setMarkingId(item.id);
    try {
      await markDelivered(id, item.id);
    } catch (error) {
      Alert.alert(
        t('kitchen.markDeliveredError'),
        error instanceof ApiError ? error.message : t('common.networkError'),
      );
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        {!connected ? (
          <View style={{ backgroundColor: theme.colors.warningSoft, borderRadius: theme.radii.md, padding: theme.spacing.sm }}>
            <Text variant="caption">{t('kitchen.reconnecting')}</Text>
          </View>
        ) : null}

        {latestTicket ? (
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="title" align="center" color="primary">
                {t('kitchen.ticket', { number: latestTicket.number })}
              </Text>
              <KitchenStatusStepper status={currentBottleneck} />
            </View>
          </Card>
        ) : null}

        {/* 4D: delivered but not paid yet — loud reminder (HU-37). */}
        {activeStage === 'delivered' && isUnpaid ? (
          <View style={{ backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radii.md, padding: theme.spacing.md }}>
            <Text variant="body" color="danger" align="center">
              {t('kitchen.unpaidWarning')}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          {KITCHEN_STATUS_SEQUENCE.map((candidate) => (
            <Chip
              key={candidate}
              label={t(STAGE_LABEL_KEYS[candidate])}
              selected={activeStage === candidate}
              onPress={() => setStage(candidate)}
            />
          ))}
        </View>

        {stageItems.length === 0 ? (
          <Card>
            <Text variant="body" color="muted" align="center">
              {t(STAGE_EMPTY_KEYS[activeStage])}
            </Text>
          </Card>
        ) : (
          stageItems.map((item) => {
            const minutes = elapsedMinutes(item.kitchenStatusChangedAt, now);
            return (
              <Card key={item.id}>
                <View style={{ gap: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="body">
                      {t('orderDetail.quantityShort', { count: item.quantity })} {item.menuItem?.name ?? ''}
                    </Text>
                    <Badge variant={item.kitchenStatus} />
                  </View>
                  {activeStage === 'preparing' ? (
                    <Text variant="caption" color="muted">
                      {t('kitchen.onFire')} · {minutes === 0 ? t('orders.justNow') : t('orders.elapsedMinutes', { count: minutes })}
                    </Text>
                  ) : null}
                  {activeStage === 'ready' ? (
                    <Button
                      size="sm"
                      onPress={() => void handleMarkDelivered(item)}
                      loading={markingId === item.id}
                    >
                      {t('kitchen.markDelivered')}
                    </Button>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
