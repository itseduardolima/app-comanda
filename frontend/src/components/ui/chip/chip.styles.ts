import { createStyles } from '../../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  base: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  textSelected: { fontFamily: theme.fonts.semibold },
  // Selected schemes (prototype): dark for filters/points, terracotta-soft
  // for "remove ingredient", green-soft for "add ingredient".
  selectedDark: { backgroundColor: theme.colors.dark, borderColor: theme.colors.dark },
  selectedDarkText: { color: theme.colors.onDark },
  selectedPrimary: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primarySoftBorder,
  },
  selectedPrimaryText: { color: theme.colors.primary },
  selectedSuccess: {
    backgroundColor: theme.colors.successSofter,
    borderColor: theme.colors.successBorderStrong,
  },
  selectedSuccessText: { color: theme.colors.success },
}));
