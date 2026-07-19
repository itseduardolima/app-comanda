import { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { useStyles } from './phone-frame.styles';

interface Props {
  children: ReactNode;
}

/**
 * Constrains the app to a phone-width column on web.
 *
 * The prototype — and the shipped target — is a handheld screen, so on a
 * desktop browser the layout would otherwise stretch a keypad or a list row
 * across 1500px and stop resembling the design. Native is untouched: the
 * device already provides the constraint.
 */
export function PhoneFrame({ children }: Props) {
  const styles = useStyles();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  return (
    <View style={styles.backdrop}>
      <View style={styles.frame}>{children}</View>
    </View>
  );
}
