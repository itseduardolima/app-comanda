import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Text } from '@/components/ui/text/text';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { useStyles } from '@/styles/screens/login.styles';
import { useTheme } from '@/theme/theme-provider';
import { ApiError } from '@/types/errors';

/** Screen 00 — Login: username step of the auth flow (HU-14). */
export default function LoginScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
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
      const result = await login(trimmed);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logo}>
            <RNText style={styles.logoText}>{theme.brand.monogram}</RNText>
          </View>
          <View style={styles.header}>
            <RNText style={styles.brandKicker}>{theme.brand.name}</RNText>
            <Text variant="title">{t('auth.loginTitle')}</Text>
            <Text variant="body" color="muted">
              {t('auth.loginSubtitle')}
            </Text>
          </View>
          <View style={styles.form}>
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
            <Text variant="caption" color="muted">
              {t('auth.loginHint')}
            </Text>
          </View>
          <Button size="lg" onPress={() => void handleContinue()} loading={loading} disabled={!username.trim()}>
            {t('auth.continue')}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
