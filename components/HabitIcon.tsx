import { StyleSheet, Text, View } from 'react-native';
import { withAlpha } from '@/constants/theme';

/** Tinted rounded square showing the habit's initial. */
export function HabitIcon({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size * 0.32, backgroundColor: withAlpha(color, 0.16) },
      ]}
    >
      <Text style={[styles.letter, { color, fontSize: size * 0.42 }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '700' },
});
