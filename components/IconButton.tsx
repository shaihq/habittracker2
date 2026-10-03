import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface IconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}

export function IconButton({ onPress, accessibilityLabel, children }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
