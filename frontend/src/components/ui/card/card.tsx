import { ReactNode } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/theme-provider';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Surface container used by every list card in the app. */
export function Card({ children, onPress, style }: Props) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  };

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        base,
        pressed && { backgroundColor: theme.colors.surfacePressed },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
