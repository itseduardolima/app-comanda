import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { formatCents, t } from '../../i18n';
import { useTheme } from '../../theme/theme-provider';
import { MenuItem } from '../../types/menu';
import { Card } from '../ui/card/card';
import { Text } from '../ui/text/text';
import { useStyles } from './menu-item-card.styles';

interface Props {
  item: MenuItem;
  /** Ordering mode (HU-07): "+" quick-adds; tapping the row customizes. */
  onAdd?: () => void;
  onCustomize?: () => void;
}

export function MenuItemCard({ item, onAdd, onCustomize }: Props) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <Card style={styles.card} onPress={onCustomize}>
      <View style={styles.row}>
        <View style={styles.thumb} />
        <View style={styles.info}>
          <Text variant="body" weight="semibold">
            {item.name}
          </Text>
          <Text variant="caption" color="secondary" weight="semibold">
            {formatCents(item.price)}
          </Text>
        </View>
        {onAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('menu.addDirect')}
            onPress={onAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}
