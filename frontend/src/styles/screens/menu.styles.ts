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
    // flexShrink: 0 is the load-bearing half. Without it the row is a flex
    // child with the default shrink of 1, so once the list below overflows
    // the column the chips get squeezed to nothing and the items render on
    // top of them. flexGrow: 0 alone only stops it from expanding.
    flexGrow: 0,
    flexShrink: 0,
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
