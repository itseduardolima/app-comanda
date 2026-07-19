import { Alert, View } from 'react-native';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { Text } from '@/components/ui/text/text';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/i18n';
import { useStyles } from '@/styles/screens/profile.styles';
import { useTheme } from '@/theme/theme-provider';

/** Profile tab — operator info and logout (HU-17). */
export default function ProfileScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { operator, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.logout'), style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="title" color="onPrimary">
              {(operator?.name ?? '?').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text variant="subtitle">{operator?.name}</Text>
          <Text variant="caption" color="muted">
            {t('profile.operator')} · {theme.brand.name}
          </Text>
        </View>
      </Card>
      <Button variant="danger" onPress={handleLogout}>
        {t('auth.logout')}
      </Button>
    </View>
  );
}
