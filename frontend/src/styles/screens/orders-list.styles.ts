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
  offlineBanner: {
    backgroundColor: theme.colors.warningSoft,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  separator: {
    height: theme.spacing.sm,
  },
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
}));
