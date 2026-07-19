import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
  },
  labelFuture: { color: theme.colors.textFaint },
  labelPast: { color: theme.colors.success },
  labelQueued: { color: theme.colors.primary },
  labelPreparing: { color: theme.colors.warning },
  labelReady: { color: theme.colors.success },
  labelDelivered: { color: theme.colors.success },
  track: {
    height: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.track,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  fillQueued: { width: '12%', backgroundColor: theme.colors.primary },
  fillPreparing: { width: '45%', backgroundColor: theme.colors.gold },
  fillReady: { width: '72%', backgroundColor: theme.colors.success },
  fillDelivered: { width: '100%', backgroundColor: theme.colors.success },
}));
