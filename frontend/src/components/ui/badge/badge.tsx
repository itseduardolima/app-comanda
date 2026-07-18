import { Text as RNText, View } from 'react-native';
import { t, TranslationKey } from '../../../i18n';
import { useTheme } from '../../../theme/theme-provider';

/** One badge per domain state — payment and kitchen status (glossary-mapped). */
export type BadgeVariant = 'paid' | 'unpaid' | 'queued' | 'preparing' | 'ready' | 'delivered';

const LABEL_KEYS: Record<BadgeVariant, TranslationKey> = {
  paid: 'orders.paid',
  unpaid: 'orders.unpaid',
  queued: 'kitchen.statusQueued',
  preparing: 'kitchen.statusPreparing',
  ready: 'kitchen.statusReady',
  delivered: 'kitchen.statusDelivered',
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const theme = useTheme();
  const palette: Record<BadgeVariant, { bg: string; fg: string }> = {
    paid: { bg: theme.colors.successSoft, fg: theme.colors.success },
    unpaid: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    queued: { bg: theme.colors.neutralSoft, fg: theme.colors.statusQueued },
    preparing: { bg: theme.colors.warningSoft, fg: theme.colors.statusPreparing },
    ready: { bg: theme.colors.successSoft, fg: theme.colors.statusReady },
    delivered: { bg: theme.colors.neutralSoft, fg: theme.colors.statusDelivered },
  };
  const { bg, fg } = palette[variant];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <RNText style={[theme.typography.caption, { color: fg, fontWeight: '600' }]}>
        {t(LABEL_KEYS[variant])}
      </RNText>
    </View>
  );
}
