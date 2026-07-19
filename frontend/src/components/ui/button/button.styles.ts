import { createStyles } from '../../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  base: {
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sizeSm: { height: 38, paddingHorizontal: theme.spacing.sm, borderRadius: theme.radii.md },
  sizeMd: { height: 50, paddingHorizontal: theme.spacing.md, borderRadius: 15 },
  sizeLg: { height: 54, paddingHorizontal: theme.spacing.lg },
  primary: { backgroundColor: theme.colors.primary },
  primaryPressed: { backgroundColor: theme.colors.primaryPressed },
  dark: { backgroundColor: theme.colors.dark },
  darkPressed: { backgroundColor: theme.colors.darkPressed },
  success: { backgroundColor: theme.colors.success },
  successPressed: { backgroundColor: theme.colors.success, opacity: 0.9 },
  danger: { backgroundColor: theme.colors.primary },
  dangerPressed: { backgroundColor: theme.colors.primaryPressed },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.surfacePressed,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  ghostPressed: { backgroundColor: 'transparent', opacity: 0.7 },
  dimmed: { opacity: 0.55 },
}));
