/**
 * Design tokens — single source of every color, font, spacing and radius.
 * Values imported from the reference prototype "App Garcom Fogo e Brasa"
 * (claude.ai/design project "Protótipo PDV Fogo Brasa"). Components never
 * hardcode visual values; they read tokens via useTheme()/createStyles.
 *
 * MVP ships a single light theme: the app is used in bright dining rooms
 * (HU-02 decision) — dark mode can land later as a second ThemeTokens object.
 */
import { TextStyle } from 'react-native';

export interface BrandConfig {
  /** Establishment name shown on Login and headers — configuration, not code. */
  name: string;
  /** Short tagline shown on the Login screen. */
  tagline: string;
  /** Single letter used as the logo mark (prototype: "F"). */
  monogram: string;
}

export interface ThemeTokens {
  brand: BrandConfig;
  colors: {
    /** Screen background (warm off-white). */
    background: string;
    surface: string;
    surfacePressed: string;
    /** Neutral soft fill for icon boxes / modifier chips. */
    neutralSoft: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textFaint: string;
    onPrimary: string;
    onDark: string;
    border: string;
    divider: string;
    /** Terracotta brand color. */
    primary: string;
    primaryPressed: string;
    primarySoft: string;
    primarySoftBorder: string;
    /** Near-black used for active chips and dark buttons. */
    dark: string;
    darkPressed: string;
    success: string;
    successSoft: string;
    successSofter: string;
    successBorder: string;
    /** Stronger green border used by selected "add ingredient" chips. */
    successBorderStrong: string;
    warning: string;
    warningSoft: string;
    warningBorder: string;
    /** Darker amber for text over warningSoft (unpaid banner). */
    warningDeep: string;
    /** Occupied-table gold dot. */
    gold: string;
    danger: string;
    dangerSoft: string;
    /** Progress bar track (kitchen stepper). */
    track: string;
    overlay: string;
  };
  fonts: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radii: { sm: number; md: number; lg: number; xl: number; pill: number };
  typography: {
    /** Big screen title (26). */
    title: TextStyle;
    /** Section/screen heading (20). */
    heading: TextStyle;
    subtitle: TextStyle;
    body: TextStyle;
    caption: TextStyle;
    /** Uppercase section label (11, letterspaced). */
    label: TextStyle;
    button: TextStyle;
  };
}

const fonts = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
};

/** Demo brand from the reference prototype — replace to rebrand the app. */
export const defaultTheme: ThemeTokens = {
  brand: {
    name: 'Fogo & Brasa',
    tagline: 'Churrascaria',
    monogram: 'F',
  },
  colors: {
    background: '#F7F5F1',
    surface: '#FFFFFF',
    surfacePressed: '#F2EEE7',
    neutralSoft: '#F2EEE7',
    text: '#211E1A',
    textSecondary: '#57534C',
    textMuted: '#8C867C',
    textFaint: '#B4AEA4',
    onPrimary: '#FFFFFF',
    onDark: '#FFFFFF',
    border: '#EBE6DE',
    divider: '#F1ECE4',
    primary: '#C4472A',
    primaryPressed: '#9E3319',
    primarySoft: '#FBEDE8',
    primarySoftBorder: '#E8B3A3',
    dark: '#211E1A',
    darkPressed: '#3A352F',
    success: '#3B7A57',
    successSoft: '#E4EEE7',
    successSofter: '#F1F6F2',
    successBorder: '#C9E0D1',
    successBorderStrong: '#A9CDB6',
    warning: '#B5711C',
    warningSoft: '#F6EBD8',
    warningBorder: '#E6D2AC',
    warningDeep: '#8A6A2E',
    gold: '#C8A23A',
    danger: '#C4472A',
    dangerSoft: '#FBEDE8',
    track: '#E9E4DB',
    overlay: 'rgba(33, 30, 26, 0.5)',
  },
  fonts,
  spacing: { xs: 4, sm: 8, md: 16, lg: 22, xl: 32, xxl: 48 },
  radii: { sm: 10, md: 13, lg: 16, xl: 18, pill: 999 },
  typography: {
    title: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.6 },
    heading: { fontFamily: fonts.bold, fontSize: 20 },
    subtitle: { fontFamily: fonts.semibold, fontSize: 16 },
    body: { fontFamily: fonts.regular, fontSize: 14 },
    caption: { fontFamily: fonts.regular, fontSize: 12 },
    label: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    button: { fontFamily: fonts.semibold, fontSize: 16 },
  },
};
