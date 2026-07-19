import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuItemCard } from '@/components/menu-item-card/menu-item-card';
import { Button } from '@/components/ui/button/button';
import { Chip } from '@/components/ui/chip/chip';
import { Text } from '@/components/ui/text/text';
import { useMenu } from '@/hooks/use-menu';
import { useOrderActions, useOrderOptional } from '@/hooks/use-orders';
import { t, tCount } from '@/i18n';
import { useStyles } from '@/styles/screens/menu.styles';
import { MenuItem } from '@/types/menu';

/**
 * Screen 02 — Cardápio (HU-07/HU-26). With an `orderId` param the screen is
 * in ordering mode (quick add, customize, "Ver comanda" with item count);
 * without it, it is free browsing from the tab bar.
 */
export default function MenuScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { categories, categoryNames, loading, loadError, reload } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const order = useOrderOptional(orderId);
  const { addItemLocal } = useOrderActions();

  const visibleCategories = useMemo(
    () =>
      selectedCategory === null
        ? categories
        : categories.filter((group) => group.category === selectedCategory),
    [categories, selectedCategory],
  );

  const itemCount = order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleAdd = (item: MenuItem) => {
    if (orderId) {
      addItemLocal(orderId, item, 1);
    }
  };

  const handleCustomize = (item: MenuItem) => {
    if (orderId) {
      router.push({
        pathname: '/orders/[id]/customize',
        params: { id: orderId, menuItemId: item.id },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text variant="title">{t('menu.title')}</Text>
        {!orderId ? (
          <Text variant="caption" color="muted">
            {t('menu.browsingOnly')}
          </Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryRow}>
            <Chip
              label={t('orders.filterAll')}
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {categoryNames.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </View>
        </ScrollView>
        {loadError ? (
          <View style={styles.errorState}>
            <Text variant="body" color="muted" align="center">
              {t('menu.loadError')}
            </Text>
            <Button variant="secondary" size="sm" onPress={() => void reload()}>
              {t('common.retry')}
            </Button>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            {loading && categories.length === 0 ? (
              <Text variant="body" color="muted" align="center">
                {t('common.loading')}
              </Text>
            ) : null}
            {visibleCategories.map((group) => (
              <View key={group.category} style={styles.categoryGroup}>
                <Text variant="subtitle">{group.category}</Text>
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={orderId ? () => handleAdd(item) : undefined}
                    onCustomize={orderId ? () => handleCustomize(item) : undefined}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        )}
        {orderId ? (
          <Button
            size="lg"
            onPress={() => router.push({ pathname: '/orders/[id]', params: { id: orderId } })}
          >
            {t('menu.viewOrder')}
            {itemCount > 0 ? ` (${tCount('orders.itemsCount', itemCount)})` : ''}
          </Button>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
