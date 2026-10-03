import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { AddHabitForm } from '@/components/AddHabitForm';
import { IconButton } from '@/components/IconButton';
import { colors, spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitsContext';
import type { HabitInput } from '@/types/database';

/** Create a habit, or edit one when an `id` param is passed. */
export default function AddHabitScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, createHabit, updateHabit } = useHabits();
  const existing = id ? habits.find((h) => h.id === id) : undefined;

  const onSubmit = async (values: HabitInput) => {
    if (existing) await updateHabit(existing.id, values);
    else await createHabit(values);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>{existing ? 'Edit habit' : 'New habit'}</Text>
          <IconButton onPress={() => router.back()} accessibilityLabel="Close">
            <X size={18} color={colors.textMuted} />
          </IconButton>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AddHabitForm
            initialValues={
              existing && {
                name: existing.name,
                description: existing.description,
                frequency: existing.frequency,
                color: existing.color,
              }
            }
            submitLabel={existing ? 'Save changes' : 'Create habit'}
            onSubmit={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
