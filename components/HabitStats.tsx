import { StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '@/constants/theme';

interface HabitStatsProps {
  streak: number;
  weekCount: number;
  weekTarget: number;
  color: string;
}

/** Compact streak + weekly progress line used on habit cards. */
export function HabitStats({ streak, weekCount, weekTarget, color }: HabitStatsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <Flame size={15} color={streak > 0 ? color : colors.textSubtle} />
        <Text style={styles.text}>
          {streak} day streak
        </Text>
      </View>
      <Text style={styles.text}>
        {Math.min(weekCount, weekTarget)} of {weekTarget} this week
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
});
