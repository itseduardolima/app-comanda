import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useStyles } from './card.styles';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Surface container used by every list card in the app. */
export function Card({ children, onPress, style }: Props) {
  const styles = useStyles();

  if (!onPress) {
    return <View style={[styles.base, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}
