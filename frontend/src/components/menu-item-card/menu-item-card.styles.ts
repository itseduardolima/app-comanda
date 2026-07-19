import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  card: {
    padding: 11,
    borderRadius: theme.radii.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.neutralSoft,
    flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
}));
