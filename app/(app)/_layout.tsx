import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { HabitsProvider } from '@/context/HabitsContext';

export default function AppLayout() {
  return (
    <HabitsProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="habit/[id]" />
        <Stack.Screen name="add-habit" options={{ presentation: 'modal' }} />
      </Stack>
    </HabitsProvider>
  );
}
