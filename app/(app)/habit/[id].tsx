import { useMemo } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { ContributionGrid } from '@/components/ContributionGrid';
import { HabitIcon } from '@/components/HabitIcon';
import { IconButton } from '@/components/IconButton';
import { colors, radii, spacing } from '@/constants/theme';
import { useHabit, useHabits } from '@/context/HabitsContext';
import { tapFeedback } from '@/lib/haptics';
import type { ISODate } from '@/types/database';
import { todayISO } from '@/utils/dates';
import { calculateStreak, countThisWeek, frequencyOptions, weeklyTarget } from '@/utils/streaks';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habit, completedDates } = useHabit(id);
  const { toggleCompletion, deleteHabit, isLoading } = useHabits();
  const today = todayISO();

  const stats = useMemo(
    () => ({
      streak: calculateStreak(completedDates, today),
      total: completedDates.size,
      week: countThisWeek(completedDates, today),
    }),
    [completedDates, today],
  );

  if (!habit && isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.textMuted} />
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.muted}>This habit no longer exists.</Text>
        <Button label="Back to habits" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const onToggle = (date: ISODate) => {
    tapFeedback();
    toggleCompletion(habit.id, date);
  };

  const confirmDelete = () => {
    const remove = async () => {
      try {
        await deleteHabit(habit.id);
        router.back();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Could not delete habit.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Delete failed', msg);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${habit.name}"? This removes its history.`)) remove();
      return;
    }
    Alert.alert('Delete habit?', `"${habit.name}" and its history will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  };

  const target = weeklyTarget(habit.frequency);
  const frequencyLabel = frequencyOptions.find((o) => o.value === habit.frequency)?.label;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.nav}>
        <IconButton onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft size={20} color={colors.text} />
        </IconButton>
        <IconButton
          onPress={() => router.push({ pathname: '/add-habit', params: { id: habit.id } })}
          accessibilityLabel="Edit habit"
        >
          <Pencil size={16} color={colors.textMuted} />
        </IconButton>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <HabitIcon name={habit.name} color={habit.color} size={52} />
          <View style={styles.titles}>
            <Text style={styles.name}>{habit.name}</Text>
            {habit.description ? <Text style={styles.muted}>{habit.description}</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <ContributionGrid completedDates={completedDates} color={habit.color} cellSize={18} gap={4} showMonthLabels onToggle={onToggle} />
          <Text style={styles.hint}>Tap any day to mark or unmark it.</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Current streak" value={`${stats.streak}`} unit={stats.streak === 1 ? 'day' : 'days'} color={habit.color} />
          <Stat label="This week" value={`${Math.min(stats.week, target)}/${target}`} unit={frequencyLabel ?? ''} />
          <Stat label="Total" value={`${stats.total}`} unit="completions" />
        </View>

        <Button
          label="Delete habit"
          variant="danger"
          onPress={confirmDelete}
          icon={<Trash2 size={18} color={colors.danger} />}
          style={styles.delete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statUnit} numberOfLines={1}>
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  titles: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  muted: { color: colors.textMuted, fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: radii.card, padding: spacing.lg + 2, gap: spacing.md },
  hint: { color: colors.textSubtle, fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radii.card - 4, padding: spacing.lg, gap: 4 },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 },
  statUnit: { color: colors.textSubtle, fontSize: 12 },
  delete: { marginTop: spacing.lg },
});
