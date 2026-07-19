import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  errorState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  listContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  categoryGroup: {
    gap: theme.spacing.sm,
  },
}));
