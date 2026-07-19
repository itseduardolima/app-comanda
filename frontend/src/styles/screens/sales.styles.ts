import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
  },
  separator: {
    height: theme.spacing.sm,
  },
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));
