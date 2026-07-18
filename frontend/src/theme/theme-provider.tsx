import { createContext, ReactNode, useContext } from 'react';
import { defaultTheme, ThemeTokens } from './tokens';

const ThemeContext = createContext<ThemeTokens>(defaultTheme);

export function ThemeProvider({
  theme = defaultTheme,
  children,
}: {
  theme?: ThemeTokens;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Single entry point for tokens — never import `defaultTheme` in a component. */
export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
