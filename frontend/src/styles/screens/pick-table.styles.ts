import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  errorState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  columnWrapper: {
    gap: theme.spacing.sm,
  },
  listContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  tableCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radii.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  tableCardFree: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.surface,
  },
  tableCardFreePressed: {
    backgroundColor: theme.colors.successSoft,
  },
  tableCardOccupied: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSoft,
  },
  footerSection: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));
