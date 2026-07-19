import { Pressable, Text as RNText } from 'react-native';
import { useStyles } from './chip.styles';

export type ChipTone = 'dark' | 'primary' | 'success';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Selected color scheme: dark (filters), primary (remove), success (add). */
  tone?: ChipTone;
}

/** Selectable pill — list filters, ingredient toggles, meat point choices. */
export function Chip({ label, selected = false, onPress, disabled = false, tone = 'dark' }: Props) {
  const styles = useStyles();
  const selectedStyle = {
    dark: styles.selectedDark,
    primary: styles.selectedPrimary,
    success: styles.selectedSuccess,
  }[tone];
  const selectedTextStyle = {
    dark: styles.selectedDarkText,
    primary: styles.selectedPrimaryText,
    success: styles.selectedSuccessText,
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: disabled || !onPress }}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.base,
        selected && selectedStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <RNText style={[styles.text, selected && styles.textSelected, selected && selectedTextStyle]}>
        {label}
      </RNText>
    </Pressable>
  );
}
