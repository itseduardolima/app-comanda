import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/theme-provider';
import { Text } from '../ui/text/text';

interface Props {
  value: string;
  onChange: (pin: string) => void;
  /** Fires exactly when the 4th digit lands (auto-submit, HU-16). */
  onComplete?: (pin: string) => void;
  error?: boolean;
}

const PIN_LENGTH = 4;

/** 4-digit PIN entry with numeric keyboard and dot boxes (screens 00A/00B). */
export function PinInput({ value, onChange, onComplete, error = false }: Props) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, PIN_LENGTH);
    onChange(digits);
    if (digits.length === PIN_LENGTH) {
      onComplete?.(digits);
    }
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'center' }}>
        {Array.from({ length: PIN_LENGTH }, (_, index) => {
          const filled = index < value.length;
          return (
            <View
              key={index}
              style={{
                width: 56,
                height: 64,
                borderRadius: theme.radii.md,
                borderWidth: 2,
                borderColor: error
                  ? theme.colors.danger
                  : filled
                    ? theme.colors.primary
                    : theme.colors.border,
                backgroundColor: theme.colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="title">{filled ? '•' : ' '}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={PIN_LENGTH}
        autoFocus
        secureTextEntry
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        testID="pin-hidden-input"
      />
    </Pressable>
  );
}
