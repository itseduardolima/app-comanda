import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Text } from '@/components/ui/text/text';
import { t } from '@/i18n';
import { useTheme } from '@/theme/theme-provider';

/** Screen 00 — Login: username step of the auth flow (HU-14). */
export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || loading) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(trimmed);
      const params = { operatorId: result.operatorId, username: trimmed };
      if (result.pinSet) {
        router.push({ pathname: '/(auth)/pin-verify', params });
      } else {
        router.push({ pathname: '/(auth)/pin-create', params });
      }
    } catch (err) {
      setError(err instanceof ApiError && err.statusCode === 404 ? t('auth.unknownUser') : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}
      >
        <View style={{ gap: theme.spacing.lg }}>
          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <Text variant="title" color="primary">
              {theme.brand.name}
            </Text>
            <Text variant="caption" color="muted">
              {theme.brand.tagline}
            </Text>
          </View>
          <Text variant="subtitle">{t('auth.loginTitle')}</Text>
          <Input
            label={t('auth.usernameLabel')}
            placeholder={t('auth.usernamePlaceholder')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => void handleContinue()}
            error={error}
            testID="username-input"
          />
          <Button onPress={() => void handleContinue()} loading={loading} disabled={!username.trim()}>
            {t('auth.continue')}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
