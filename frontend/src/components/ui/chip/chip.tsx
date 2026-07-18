import { Pressable, Text as RNText } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/** Selectable pill — list filters, ingredient toggles, meat point choices. */
export function Chip({ label, selected = false, onPress, disabled = false }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radii.pill,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <RNText
        style={[
          theme.typography.caption,
          {
            color: selected ? theme.colors.onPrimary : theme.colors.text,
            fontWeight: '600',
          },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  );
}
