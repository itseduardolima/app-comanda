import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinInput } from '@/components/pin-input/pin-input';
import { Button } from '@/components/ui/button/button';
import { Text } from '@/components/ui/text/text';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { useStyles } from '@/styles/screens/pin-verify.styles';

/** Screen 00B — quick access by PIN, auto-submit on 4th digit (HU-16). */
export default function PinVerifyScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { verifyPin } = useAuth();
  const { operatorId, username } = useLocalSearchParams<{ operatorId: string; username: string }>();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async (typed: string) => {
    setLoading(true);
    setError(null);
    try {
      await verifyPin(operatorId, typed);
    } catch {
      // Wrong PIN: show the error and clear for a new attempt (stay here).
      setError(t('auth.wrongPin'));
      setPin('');
      setLoading(false);
    }
  };

  const handleSwitchUser = () => {
    // Discard any partially typed PIN and go back to a clean Login (HU-17).
    setPin('');
    setError(null);
    router.dismissTo('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="title">{t('auth.verifyPinTitle')}</Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.verifyPinSubtitle')}
          </Text>
          {username ? (
            <Text variant="caption" color="muted">
              {t('auth.hello')}, {username}
            </Text>
          ) : null}
        </View>
        <PinInput value={pin} onChange={setPin} onComplete={(typed) => void handleComplete(typed)} error={error !== null} />
        {error ? (
          <Text variant="caption" color="danger" align="center">
            {error}
          </Text>
        ) : null}
        {loading ? (
          <Text variant="caption" color="muted" align="center">
            {t('common.loading')}
          </Text>
        ) : null}
        <Button variant="ghost" onPress={handleSwitchUser}>
          {t('auth.switchUser')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
