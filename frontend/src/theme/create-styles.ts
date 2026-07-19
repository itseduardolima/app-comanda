import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './theme-provider';
import { ThemeTokens } from './tokens';

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * Style-file pattern: every component/screen keeps its styles in a sibling
 * `*.styles.ts` file built with this helper — JSX never carries inline
 * `style={{ … }}` objects. The factory receives the theme so all values stay
 * token-driven (no hardcoded colors), and the result is memoized per theme.
 *
 *   // foo.styles.ts
 *   export const useStyles = createStyles((theme) => ({
 *     container: { backgroundColor: theme.colors.background },
 *   }));
 */
export function createStyles<T extends NamedStyles<T>>(
  factory: (theme: ThemeTokens) => T,
): () => T {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
