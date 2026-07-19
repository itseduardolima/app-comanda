import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { KitchenStatusStepper } from '@/components/kitchen-status-stepper/kitchen-status-stepper';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { Chip } from '@/components/ui/chip/chip';
import { useKitchenSocket } from '@/hooks/use-kitchen-socket';
import { useNow, elapsedMinutes } from '@/hooks/use-now';
import { useKitchenTickets, useOrder, useOrderActions } from '@/hooks/use-orders';
import { t } from '@/i18n';
import { useStyles } from '@/styles/screens/kitchen-status.styles';
import { ApiError } from '@/types/errors';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus, OrderItem } from '@/types/order';

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
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order } = useOrder(id);
  const { connected } = useKitchenSocket(id);
  const { tickets } = useKitchenTickets(id);
  const { markDelivered } = useOrderActions();
  const now = useNow(15_000);
  const [stage, setStage] = useState<KitchenStatus | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!connected ? (
          <View style={styles.reconnectingBanner}>
            <Text variant="caption">{t('kitchen.reconnecting')}</Text>
          </View>
        ) : null}

        {latestTicket ? (
          <Card>
            <View style={styles.ticketBody}>
              <Text variant="title" align="center" color="primary">
                {t('kitchen.ticket', { number: latestTicket.number })}
              </Text>
              <KitchenStatusStepper status={currentBottleneck} />
            </View>
          </Card>
        ) : null}

        {/* 4D: delivered but not paid yet — loud reminder (HU-37). */}
        {activeStage === 'delivered' && isUnpaid ? (
          <View style={styles.unpaidBanner}>
            <Text variant="body" color="danger" align="center">
              {t('kitchen.unpaidWarning')}
            </Text>
          </View>
        ) : null}

        <View style={styles.stageChips}>
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
                <View style={styles.itemBody}>
                  <View style={styles.itemRow}>
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
