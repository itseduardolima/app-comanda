import { Text as RNText, View } from 'react-native';
import { t, TranslationKey } from '../../../i18n';
import { useStyles } from './badge.styles';

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
  const styles = useStyles();
  return (
    <View style={[styles.base, styles[variant]]}>
      <RNText style={[styles.text, styles[`${variant}Text`]]}>{t(LABEL_KEYS[variant])}</RNText>
    </View>
  );
}
