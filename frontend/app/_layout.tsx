import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
  useFonts,
} from '@expo-google-fonts/rubik';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { ThemeProvider, useTheme } from '@/theme/theme-provider';

void SplashScreen.preventAutoHideAsync();

/**
 * Root layout: brand fonts, theme and session guard (HU-18). Routes under
 * the guarded groups only render with a valid session; expo-router redirects
 * to the (auth) stack whenever the token is cleared (logout or 401).
 */
function RootStack() {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.fonts.bold, fontSize: 20 },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="orders/new" options={{ title: t('newOrder.title') }} />
        <Stack.Screen name="orders/pick-table" options={{ title: t('pickTable.title') }} />
        <Stack.Screen name="orders/[id]/index" options={{ title: t('orderDetail.title') }} />
        <Stack.Screen name="orders/[id]/customize" options={{ title: t('customize.title') }} />
        <Stack.Screen name="orders/[id]/kitchen" options={{ title: t('kitchen.title') }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { hydrated, hydrate } = useAuth();
  const [fontsLoaded, fontsError] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const ready = hydrated && (fontsLoaded || fontsError !== null);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    // Native splash stays visible while fonts and the session load.
    return null;
  }

  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <RootStack />
    </ThemeProvider>
  );
}
