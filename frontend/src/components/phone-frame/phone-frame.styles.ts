import { createStyles } from '../../theme/create-styles';

/** Roughly a large phone in CSS pixels — the width the prototype was drawn for. */
export const PHONE_MAX_WIDTH = 480;

export const useStyles = createStyles((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.neutralSoft,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: PHONE_MAX_WIDTH,
    backgroundColor: theme.colors.background,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
  },
}));
