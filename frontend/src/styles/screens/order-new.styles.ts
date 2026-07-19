import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderColor: theme.colors.border,
    borderWidth: 2,
  },
  typeCardSelected: {
    borderColor: theme.colors.primary,
  },
}));
