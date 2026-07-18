import { Stack } from 'expo-router';

/** Auth stack (screens 00/00A/00B) — no tab bar, no native headers. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
