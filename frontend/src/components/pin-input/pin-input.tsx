import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/theme-provider';
import { useStyles } from './pin-input.styles';

interface Props {
  value: string;
  onChange: (pin: string) => void;
  /** Fires exactly when the 4th digit lands (auto-submit, HU-16). */
  onComplete?: (pin: string) => void;
  error?: boolean;
  /** Optional bottom-left keypad action (e.g. "Trocar" on screen 00B). */
  leftAction?: { label: string; onPress: () => void };
}

const PIN_LENGTH = 4;
const DIGIT_ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * PIN entry from the prototype: four dots plus an in-screen numeric keypad
 * (no system keyboard) — screens 00A/00B.
 */
export function PinInput({ value, onChange, onComplete, error = false, leftAction }: Props) {
  const styles = useStyles();
  const theme = useTheme();

  const pressDigit = (digit: string) => {
    if (value.length >= PIN_LENGTH) {
      return;
    }
    const next = value + digit;
    onChange(next);
    if (next.length === PIN_LENGTH) {
      onComplete?.(next);
    }
  };

  const pressBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const renderKey = (digit: string) => (
    <View key={digit} style={styles.keyCell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={digit}
        onPress={() => pressDigit(digit)}
        style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
      >
        <RNText style={styles.keyText}>{digit}</RNText>
      </Pressable>
    </View>
  );

  return (
    <View>
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }, (_, index) => (
          <View
            key={index}
            testID={index < value.length ? 'pin-dot-filled' : 'pin-dot-empty'}
            style={[styles.dot, index < value.length && styles.dotFilled, error && styles.dotError]}
          />
        ))}
      </View>
      <View style={styles.keypad}>
        {DIGIT_ROWS.map(renderKey)}
        <View style={styles.keyCell}>
          {leftAction ? (
            <Pressable
              accessibilityRole="button"
              onPress={leftAction.onPress}
              style={({ pressed }) => [styles.keyGhost, pressed && styles.keyGhostPressed]}
            >
              <RNText style={styles.keyActionText}>{leftAction.label}</RNText>
            </Pressable>
          ) : (
            <View style={styles.keyGhost} />
          )}
        </View>
        {renderKey('0')}
        <View style={styles.keyCell}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="backspace"
            onPress={pressBackspace}
            style={({ pressed }) => [styles.keyGhost, pressed && styles.keyGhostPressed]}
          >
            <Ionicons name="backspace-outline" size={22} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
