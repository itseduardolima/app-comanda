import { createStyles } from '../../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  container: { gap: theme.spacing.sm },
  field: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 0,
    height: 50,
    color: theme.colors.text,
  },
  fieldFocused: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  fieldError: {
    borderColor: theme.colors.danger,
  },
  fieldMultiline: {
    height: 96,
    paddingVertical: theme.spacing.sm,
    textAlignVertical: 'top',
  },
}));
