import { View } from 'react-native';
import { formatCents, t } from '../../i18n';
import { useTheme } from '../../theme/theme-provider';
import { MenuItem } from '../../types/menu';
import { Button } from '../ui/button/button';
import { Card } from '../ui/card/card';
import { Text } from '../ui/text/text';

interface Props {
  item: MenuItem;
  /** When editing an order: quick-add and customize actions (HU-07). */
  onAdd?: () => void;
  onCustomize?: () => void;
}

export function MenuItemCard({ item, onAdd, onCustomize }: Props) {
  const theme = useTheme();
  return (
    <Card>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexShrink: 1 }}>
            <Text variant="body">{item.name}</Text>
          </View>
          <Text variant="subtitle" color="primary">
            {formatCents(item.price)}
          </Text>
        </View>
        {onAdd || onCustomize ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {onAdd ? (
              <View style={{ flex: 1 }}>
                <Button size="sm" variant="primary" onPress={onAdd}>
                  {t('menu.addDirect')}
                </Button>
              </View>
            ) : null}
            {onCustomize ? (
              <View style={{ flex: 1 }}>
                <Button size="sm" variant="secondary" onPress={onCustomize}>
                  {t('menu.customize')}
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
