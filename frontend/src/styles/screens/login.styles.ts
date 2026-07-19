import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    color: theme.colors.onPrimary,
  },
  brandKicker: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: theme.colors.primary,
  },
  header: {
    gap: theme.spacing.xs,
  },
  form: {
    gap: theme.spacing.sm,
  },
}));
