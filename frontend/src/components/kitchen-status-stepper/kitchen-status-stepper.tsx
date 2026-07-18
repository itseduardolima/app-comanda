import { View } from 'react-native';
import { t } from '../../i18n';
import { useTheme } from '../../theme/theme-provider';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus } from '../../types/order';
import { Text } from '../ui/text/text';

const STEP_LABEL_KEYS = [
  'kitchen.stepSent',
  'kitchen.stepPreparing',
  'kitchen.stepReady',
  'kitchen.stepDelivered',
] as const;

/** 4-step progress (Enviado → Preparo → Pronto → Entregue) — screens 4A–4D. */
export function KitchenStatusStepper({ status }: { status: KitchenStatus }) {
  const theme = useTheme();
  const currentIndex = KITCHEN_STATUS_SEQUENCE.indexOf(status);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {STEP_LABEL_KEYS.map((labelKey, index) => {
        const reached = index <= currentIndex;
        const isLast = index === STEP_LABEL_KEYS.length - 1;
        return (
          <View key={labelKey} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={{ flex: 1, height: 2, backgroundColor: index === 0 ? 'transparent' : reached ? theme.colors.primary : theme.colors.border }} />
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: theme.radii.pill,
                  backgroundColor: reached ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 2,
                  borderColor: reached ? theme.colors.primary : theme.colors.border,
                }}
              />
              <View style={{ flex: 1, height: 2, backgroundColor: isLast ? 'transparent' : index < currentIndex ? theme.colors.primary : theme.colors.border }} />
            </View>
            <View style={{ marginTop: theme.spacing.xs }}>
              <Text variant="caption" color={reached ? 'primary' : 'muted'}>
                {t(labelKey)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
