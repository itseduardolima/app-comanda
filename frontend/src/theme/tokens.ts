/**
 * Design tokens — the single source of every color, spacing, radius and font
 * size in the app. Components never hardcode visual values; they read tokens
 * via useTheme(). Swapping the brand below rebrands the whole product.
 *
 * MVP supports a single light theme: the app is used in bright dining rooms
 * and kitchens, where dark UIs hurt readability (decision documented per
 * HU-02 — dark mode can be added later as a second `ThemeTokens` object).
 */

export interface BrandConfig {
  /** Establishment name shown on Login and headers — configuration, not code. */
  name: string;
  /** Short tagline shown on the Login screen. */
  tagline: string;
}

export interface ThemeTokens {
  brand: BrandConfig;
  colors: {
    primary: string;
    primaryPressed: string;
    onPrimary: string;
    background: string;
    surface: string;
    surfacePressed: string;
    text: string;
    textMuted: string;
    border: string;
    danger: string;
    dangerSoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    info: string;
    infoSoft: string;
    neutralSoft: string;
    overlay: string;
    /** Kitchen status accents (queued → delivered). */
    statusQueued: string;
    statusPreparing: string;
    statusReady: string;
    statusDelivered: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radii: { sm: number; md: number; lg: number; pill: number };
  typography: {
    title: { fontSize: number; fontWeight: '700' };
    subtitle: { fontSize: number; fontWeight: '600' };
    body: { fontSize: number; fontWeight: '400' };
    caption: { fontSize: number; fontWeight: '400' };
    button: { fontSize: number; fontWeight: '600' };
  };
}

/** Demo brand from the reference prototype — replace to rebrand the app. */
export const defaultTheme: ThemeTokens = {
  brand: {
    name: 'Fogo & Brasa',
    tagline: 'Churrascaria',
  },
  colors: {
    primary: '#C2410C',
    primaryPressed: '#9A3412',
    onPrimary: '#FFFFFF',
    background: '#FAF7F5',
    surface: '#FFFFFF',
    surfacePressed: '#F5EFEA',
    text: '#1C1917',
    textMuted: '#78716C',
    border: '#E7E5E4',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    neutralSoft: '#F1F5F9',
    overlay: 'rgba(28, 25, 23, 0.5)',
    statusQueued: '#64748B',
    statusPreparing: '#D97706',
    statusReady: '#16A34A',
    statusDelivered: '#78716C',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radii: { sm: 6, md: 10, lg: 16, pill: 999 },
  typography: {
    title: { fontSize: 24, fontWeight: '700' },
    subtitle: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 13, fontWeight: '400' },
    button: { fontSize: 16, fontWeight: '600' },
  },
};
