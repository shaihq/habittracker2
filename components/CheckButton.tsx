import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, withAlpha } from '@/constants/theme';

interface CheckButtonProps {
  checked: boolean;
  color: string;
  onPress: () => void;
}

/** One-tap toggle for today's completion. */
export function CheckButton({ checked, color, onPress }: CheckButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
  }, [checked, scale]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={checked ? 'Completed today. Tap to undo.' : 'Mark today as complete'}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: checked ? color : withAlpha(color, 0.12), transform: [{ scale }] },
        ]}
      >
        <Check size={20} strokeWidth={3} color={checked ? colors.onPrimary : color} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
