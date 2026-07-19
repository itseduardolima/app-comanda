import { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';
import { Text, TextColor } from '../text/text';
import { useStyles } from './button.styles';

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  accessibilityLabel?: string;
}

const TEXT_COLOR: Record<ButtonVariant, TextColor> = {
  primary: 'onPrimary',
  dark: 'onDark',
  success: 'onPrimary',
  danger: 'onPrimary',
  secondary: 'secondary',
  ghost: 'primary',
};

/**
 * The only button in the app — visual variations are variants, never new
 * components (frontend/.specs/01-arquitetura.md § Reuso).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  children,
  accessibilityLabel,
}: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const sizeStyle = { sm: styles.sizeSm, md: styles.sizeMd, lg: styles.sizeLg }[size];
  const spinnerColor =
    variant === 'secondary' || variant === 'ghost' ? theme.colors.primary : theme.colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        pressed ? styles[`${variant}Pressed`] : styles[variant],
        (disabled || loading) && styles.dimmed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text variant={size === 'sm' ? 'body' : 'subtitle'} weight="semibold" color={TEXT_COLOR[variant]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
