import { createStyles } from '../../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  base: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
  },
  paid: { backgroundColor: theme.colors.successSoft },
  paidText: { color: theme.colors.success },
  unpaid: { backgroundColor: theme.colors.warningSoft },
  unpaidText: { color: theme.colors.warning },
  queued: { backgroundColor: theme.colors.primarySoft },
  queuedText: { color: theme.colors.primary },
  preparing: { backgroundColor: theme.colors.warningSoft },
  preparingText: { color: theme.colors.warning },
  ready: { backgroundColor: theme.colors.successSofter },
  readyText: { color: theme.colors.success },
  delivered: { backgroundColor: theme.colors.successSoft },
  deliveredText: { color: theme.colors.success },
}));
