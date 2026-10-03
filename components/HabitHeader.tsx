import { StyleSheet, Text, View } from 'react-native';
import { LogOut, Plus } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { IconButton } from './IconButton';

interface HabitHeaderProps {
  onAdd: () => void;
  onLogout: () => void;
}

export function HabitHeader({ onAdd, onLogout }: HabitHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        HabitKit
      </Text>
      <View style={styles.actions}>
        <IconButton onPress={onLogout} accessibilityLabel="Log out">
          <LogOut size={18} color={colors.textMuted} />
        </IconButton>
        <IconButton onPress={onAdd} accessibilityLabel="Add habit">
          <Plus size={20} color={colors.text} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
