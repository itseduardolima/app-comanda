import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { ThemeProvider } from '@/theme/theme-provider';

/**
 * Root layout: theme + session guard (HU-18). Routes under the guarded
 * groups only render with a valid session; expo-router redirects to the
 * (auth) stack whenever the token is cleared (logout or 401).
 */
export default function RootLayout() {
  const { hydrated, isAuthenticated, hydrate } = useAuth();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    // Splash screen stays visible while the persisted session loads.
    return null;
  }

  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <Stack>
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
    </ThemeProvider>
  );
}
