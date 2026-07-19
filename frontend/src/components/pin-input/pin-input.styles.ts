import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dotError: {
    borderColor: theme.colors.danger,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
    rowGap: 12,
    marginTop: theme.spacing.lg,
  },
  keyCell: {
    width: '33.33%',
    paddingHorizontal: 6,
  },
  key: {
    height: 56,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  keyGhost: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyGhostPressed: {
    opacity: 0.7,
  },
  keyText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 23,
    color: theme.colors.text,
  },
  keyActionText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));
