import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';
import { Text } from '../text/text';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
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
  const theme = useTheme();

  const heights: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 56 };
  const paddings: Record<ButtonSize, number> = {
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  const container: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    danger: { backgroundColor: theme.colors.danger },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor: Record<ButtonVariant, 'onPrimary' | 'primary' | 'danger'> = {
    primary: 'onPrimary',
    secondary: 'primary',
    danger: 'onPrimary',
    ghost: 'primary',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          borderRadius: theme.radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        container[variant],
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? theme.colors.primary : theme.colors.onPrimary}
        />
      ) : (
        <Text variant="body" color={textColor[variant]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
