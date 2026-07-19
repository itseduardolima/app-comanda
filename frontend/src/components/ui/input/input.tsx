import { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';
import { Text } from '../text/text';
import { useStyles } from './input.styles';

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
  const styles = useStyles();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" color="muted">
          {label}
        </Text>
      ) : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={theme.colors.textFaint}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          error != null && styles.fieldError,
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
