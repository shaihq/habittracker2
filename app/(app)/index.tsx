import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { HabitCard } from '@/components/HabitCard';
import { HabitHeader } from '@/components/HabitHeader';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useHabits } from '@/context/HabitsContext';

const EMPTY: string[] = [];

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { habits, completions, isLoading, error, clearError, refresh, toggleCompletion } = useHabits();
  const openAdd = () => router.push('/add-habit');
  const initialLoad = isLoading && habits.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading && !initialLoad} onRefresh={refresh} tintColor={colors.textMuted} />
        }
        ListHeaderComponent={
          <>
            <HabitHeader onAdd={openAdd} onLogout={() => signOut().catch(() => {})} />
            {error && (
              <Pressable onPress={clearError} style={styles.error} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorDismiss}>Dismiss</Text>
              </Pressable>
            )}
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <HabitCard habit={item} completedDates={completions[item.id] ?? EMPTY} onToggle={toggleCompletion} />
        )}
        ListEmptyComponent={
          initialLoad ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Button label="Try again" variant="secondary" onPress={refresh} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No habits yet</Text>
              <Text style={styles.emptyText}>Create your first habit and start filling in the grid.</Text>
              <Button label="Add habit" onPress={openAdd} icon={<Plus size={18} color={colors.onPrimary} />} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: 80 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', maxWidth: 260, marginBottom: spacing.sm },
  error: {
    backgroundColor: colors.card,
    borderRadius: radii.input,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  errorDismiss: { color: colors.textSubtle, fontSize: 12 },
});
