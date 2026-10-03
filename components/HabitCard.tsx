import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import type { Habit, ISODate } from '@/types/database';
import { todayISO } from '@/utils/dates';
import { calculateStreak, countThisWeek, weeklyTarget } from '@/utils/streaks';
import { tapFeedback } from '@/lib/haptics';
import { CheckButton } from './CheckButton';
import { ContributionGrid } from './ContributionGrid';
import { HabitIcon } from './HabitIcon';
import { HabitStats } from './HabitStats';

interface HabitCardProps {
  habit: Habit;
  completedDates: ISODate[];
  onToggle: (habitId: string, date: ISODate) => void;
}

export const HabitCard = memo(function HabitCard({ habit, completedDates, onToggle }: HabitCardProps) {
  const today = todayISO();
  const done = useMemo(() => new Set(completedDates), [completedDates]);
  const streak = useMemo(() => calculateStreak(done, today), [done, today]);
  const weekCount = useMemo(() => countThisWeek(done, today), [done, today]);

  const toggleToday = () => {
    tapFeedback();
    onToggle(habit.id, today);
  };

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Open ${habit.name}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.header}>
        <HabitIcon name={habit.name} color={habit.color} />
        <View style={styles.titles}>
          <Text style={styles.name} numberOfLines={1}>
            {habit.name}
          </Text>
          {habit.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}
        </View>
        <CheckButton checked={done.has(today)} color={habit.color} onPress={toggleToday} />
      </View>

      <ContributionGrid completedDates={done} color={habit.color} />

      <HabitStats streak={streak} weekCount={weekCount} weekTarget={weeklyTarget(habit.frequency)} color={habit.color} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.lg + 2,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  titles: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 17, fontWeight: '600' },
  description: { color: colors.textMuted, fontSize: 13 },
});
