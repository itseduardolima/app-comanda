import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Text } from '@/components/ui/text/text';
import { useOrderActions } from '@/hooks/use-orders';
import { t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';
import { OrderType } from '@/types/order';

const TYPE_OPTIONS: { type: OrderType; labelKey: 'orders.table' | 'orders.counter' | 'orders.delivery'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'dine_in', labelKey: 'orders.table', icon: 'grid-outline' },
  { type: 'counter', labelKey: 'orders.counter', icon: 'bag-handle-outline' },
  { type: 'delivery', labelKey: 'orders.delivery', icon: 'bicycle-outline' },
];

/** Screen 1A — Nova comanda: type + optional customer name (HU-05). */
export default function NewOrderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createOrderLocal } = useOrderActions();
  const [type, setType] = useState<OrderType | null>(null);
  const [customerName, setCustomerName] = useState('');

  const handleStart = () => {
    if (!type) {
      return;
    }
    const trimmedName = customerName.trim();
    if (type === 'dine_in') {
      // Table flow: pick a free table first (screen 1B), order created there.
      router.push({ pathname: '/orders/pick-table', params: { customerName: trimmedName } });
      return;
    }
    // Counter/delivery skip table selection: create and go to the menu.
    const orderId = createOrderLocal({ type, customerName: trimmedName || undefined });
    router.replace({ pathname: '/(tabs)/menu', params: { orderId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="subtitle">{t('newOrder.typeLabel')}</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {TYPE_OPTIONS.map((option) => {
            const selected = type === option.type;
            return (
              <Card
                key={option.type}
                onPress={() => setType(option.type)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: 2,
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={selected ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text variant="caption" color={selected ? 'primary' : 'muted'} align="center">
                  {t(option.labelKey)}
                </Text>
              </Card>
            );
          })}
        </View>
        {!type ? (
          <Text variant="caption" color="muted">
            {t('newOrder.selectTypeFirst')}
          </Text>
        ) : null}
      </View>
      <Input
        label={t('newOrder.customerNameLabel')}
        placeholder={t('newOrder.customerNamePlaceholder')}
        value={customerName}
        onChangeText={setCustomerName}
        autoCapitalize="words"
      />
      <Button size="lg" onPress={handleStart} disabled={!type}>
        {t('newOrder.start')}
      </Button>
    </View>
  );
}
