import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  reconnectingBanner: {
    backgroundColor: theme.colors.warningSoft,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
  },
  ticketBody: {
    gap: theme.spacing.md,
  },
  unpaidBanner: {
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  stageChips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  itemBody: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
