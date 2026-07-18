import { ReactNode } from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

interface Props {
  variant?: TextVariant;
  color?: 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'onPrimary';
  align?: TextStyle['textAlign'];
  children: ReactNode;
  numberOfLines?: number;
}

/** Central typography — every visible text in the app renders through here. */
export function Text({ variant = 'body', color = 'default', align, children, numberOfLines }: Props) {
  const theme = useTheme();
  const colorValue = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    primary: theme.colors.primary,
    danger: theme.colors.danger,
    success: theme.colors.success,
    onPrimary: theme.colors.onPrimary,
  }[color];

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[theme.typography[variant], { color: colorValue, textAlign: align }]}
    >
      {children}
    </RNText>
  );
}
