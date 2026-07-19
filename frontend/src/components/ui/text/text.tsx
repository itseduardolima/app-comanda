import { ReactNode } from 'react';
import { Text as RNText } from 'react-native';
import { useStyles } from './text.styles';

export type TextVariant = 'title' | 'heading' | 'subtitle' | 'body' | 'caption' | 'label';
export type TextColor =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'faint'
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'onPrimary'
  | 'onDark';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface Props {
  variant?: TextVariant;
  color?: TextColor;
  /** Overrides the variant's font family (Rubik weights). */
  weight?: TextWeight;
  align?: 'center' | 'right';
  children: ReactNode;
  numberOfLines?: number;
}

/** Central typography — every visible text in the app renders through here. */
export function Text({ variant = 'body', color = 'default', weight, align, children, numberOfLines }: Props) {
  const styles = useStyles();
  const colorStyle = {
    default: styles.colorDefault,
    secondary: styles.colorSecondary,
    muted: styles.colorMuted,
    faint: styles.colorFaint,
    primary: styles.colorPrimary,
    danger: styles.colorDanger,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
    onPrimary: styles.colorOnPrimary,
    onDark: styles.colorOnDark,
  }[color];
  const weightStyle = weight
    ? {
        regular: styles.weightRegular,
        medium: styles.weightMedium,
        semibold: styles.weightSemibold,
        bold: styles.weightBold,
      }[weight]
    : undefined;
  const alignStyle = align === 'center' ? styles.alignCenter : align === 'right' ? styles.alignRight : undefined;

  return (
    <RNText numberOfLines={numberOfLines} style={[styles[variant], colorStyle, weightStyle, alignStyle]}>
      {children}
    </RNText>
  );
}
