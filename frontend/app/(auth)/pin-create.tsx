import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinInput } from '@/components/pin-input/pin-input';
import { Button } from '@/components/ui/button/button';
import { Text } from '@/components/ui/text/text';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { useStyles } from '@/styles/screens/pin-create.styles';
import { ApiError } from '@/types/errors';

/** Screen 00A — first access: define and confirm a 4-digit PIN (HU-15). */
export default function PinCreateScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { createPin } = useAuth();
  const { operatorId, username } = useLocalSearchParams<{ operatorId: string; username: string }>();

  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async (typed: string) => {
    if (firstPin === null) {
      setFirstPin(typed);
      setPin('');
      setError(null);
      return;
    }
    if (typed !== firstPin) {
      setError(t('auth.pinMismatch'));
      setFirstPin(null);
      setPin('');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createPin(operatorId, typed);
      // Session guard flips and expo-router lands on the tabs (screen 01).
    } catch (err) {
      setError(err instanceof ApiError ? t('auth.pinCreateError') : t('common.networkError'));
      setFirstPin(null);
      setPin('');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="title">{t('auth.createPinTitle')}</Text>
          <Text variant="body" color="muted" align="center">
            {firstPin === null ? t('auth.createPinSubtitle') : t('auth.confirmPinSubtitle')}
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
        <Button variant="ghost" onPress={() => router.back()}>
          {t('common.back')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
