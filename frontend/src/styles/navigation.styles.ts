import { createStyles } from '../theme/create-styles';

/**
 * Styles for the navigators themselves (header, screen background). These
 * reach expo-router through `screenOptions` rather than a JSX `style` prop,
 * but the rule is the same: token-driven, declared here, never inline.
 */
export const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  screenContent: {
    backgroundColor: theme.colors.background,
  },
}));
