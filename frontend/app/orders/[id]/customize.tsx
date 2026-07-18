import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button/button';
import { Chip } from '@/components/ui/chip/chip';
import { Input } from '@/components/ui/input/input';
import { Text } from '@/components/ui/text/text';
import { useMenu } from '@/hooks/use-menu';
import { formatCents, t } from '@/i18n';
import { useOrdersStore } from '@/store/orders.store';
import { useTheme } from '@/theme/theme-provider';
import { MeatPoint, OrderItemModifiers } from '@/types/order';

const MEAT_POINTS: { value: MeatPoint; labelKey: 'customize.pointRare' | 'customize.pointMedium' | 'customize.pointWellDone' }[] = [
  { value: 'mal_passado', labelKey: 'customize.pointRare' },
  { value: 'ao_ponto', labelKey: 'customize.pointMedium' },
  { value: 'bem_passado', labelKey: 'customize.pointWellDone' },
];

/**
 * Screen 03 — Personalizar item (HU-08): remove default ingredients, add
 * extras, meat point (when applicable) and free-text note. Confirming adds
 * the item (or saves edits) with modifiers in the contract shape.
 */
export default function CustomizeItemScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, menuItemId, itemId } = useLocalSearchParams<{
    id: string;
    menuItemId: string;
    itemId?: string;
  }>();
  const { findItem } = useMenu();
  const addItemLocal = useOrdersStore((state) => state.addItemLocal);
  const updateItemLocal = useOrdersStore((state) => state.updateItemLocal);
  const existingItem = useOrdersStore((state) =>
    itemId ? state.getOrder(id)?.items.find((item) => item.id === state.resolveId(itemId)) : undefined,
  );

  const menuItem = findItem(menuItemId) ?? existingItem?.menuItem;
  const initial = existingItem?.modifiers ?? undefined;

  const [removed, setRemoved] = useState<string[]>(initial?.remove ?? []);
  const [added, setAdded] = useState<string[]>(initial?.add ?? []);
  const [point, setPoint] = useState<MeatPoint | undefined>(initial?.point);
  const [note, setNote] = useState(initial?.note ?? '');
  const [quantity, setQuantity] = useState(existingItem?.quantity ?? 1);

  const customization = menuItem?.customization ?? undefined;

  const unitPrice = useMemo(() => {
    if (!menuItem) {
      return 0;
    }
    const extras = customization?.extraIngredients ?? [];
    return added.reduce((total, name) => {
      const extra = extras.find((candidate) => candidate.name === name);
      return total + (extra?.price ?? 0);
    }, menuItem.price);
  }, [menuItem, customization, added]);

  if (!menuItem) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" color="muted">
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  const toggle = (list: string[], setList: (next: string[]) => void, name: string) => {
    setList(list.includes(name) ? list.filter((entry) => entry !== name) : [...list, name]);
  };

  const buildModifiers = (): OrderItemModifiers | undefined => {
    const modifiers: OrderItemModifiers = {};
    if (point) {
      modifiers.point = point;
    }
    if (removed.length > 0) {
      modifiers.remove = removed;
    }
    if (added.length > 0) {
      modifiers.add = added;
    }
    if (note.trim()) {
      modifiers.note = note.trim();
    }
    return Object.keys(modifiers).length > 0 ? modifiers : undefined;
  };

  const handleConfirm = () => {
    const modifiers = buildModifiers();
    if (existingItem && itemId) {
      updateItemLocal(id, itemId, { quantity, modifiers });
    } else {
      addItemLocal(id, menuItem, quantity, modifiers);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subtitle">{menuItem.name}</Text>
          <Text variant="subtitle" color="primary">
            {formatCents(unitPrice)}
          </Text>
        </View>

        {customization?.removableIngredients?.length ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="body">{t('customize.removeSection')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {customization.removableIngredients.map((name) => (
                <Chip
                  key={name}
                  label={removed.includes(name) ? `− ${name}` : name}
                  selected={removed.includes(name)}
                  onPress={() => toggle(removed, setRemoved, name)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {customization?.extraIngredients?.length ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="body">{t('customize.addSection')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {customization.extraIngredients.map((extra) => (
                <Chip
                  key={extra.name}
                  label={`${extra.name} (+${formatCents(extra.price)})`}
                  selected={added.includes(extra.name)}
                  onPress={() => toggle(added, setAdded, extra.name)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {customization?.meatPoint ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="body">{t('customize.pointSection')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {MEAT_POINTS.map((option) => (
                <Chip
                  key={option.value}
                  label={t(option.labelKey)}
                  selected={point === option.value}
                  onPress={() => setPoint(point === option.value ? undefined : option.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Input
          label={t('customize.noteLabel')}
          placeholder={t('customize.notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="body">{t('customize.quantityLabel')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Button variant="secondary" size="sm" onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              −
            </Button>
            <Text variant="subtitle">{quantity}</Text>
            <Button variant="secondary" size="sm" onPress={() => setQuantity(quantity + 1)}>
              +
            </Button>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <Button size="lg" onPress={handleConfirm}>
          {existingItem ? t('customize.confirmSave') : t('customize.confirmAdd')} · {formatCents(unitPrice * quantity)}
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          {t('common.cancel')}
        </Button>
      </View>
    </View>
  );
}
