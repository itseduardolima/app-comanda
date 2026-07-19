import { createStyles } from '../../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  pressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
}));
