import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';
import { Text } from '../text/text';

interface Props extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'autoFocus'
    | 'keyboardType'
    | 'secureTextEntry'
    | 'maxLength'
    | 'multiline'
    | 'onSubmitEditing'
    | 'returnKeyType'
    | 'testID'
  > {
  label?: string;
  error?: string | null;
}

export function Input({ label, error, multiline, ...inputProps }: Props) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? <Text variant="caption">{label}</Text> : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          theme.typography.body,
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: multiline ? theme.spacing.sm : 0,
            height: multiline ? 96 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
            color: theme.colors.text,
          },
        ]}
      />
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
