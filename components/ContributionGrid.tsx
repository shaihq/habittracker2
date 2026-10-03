import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { colors, radii, withAlpha } from '@/constants/theme';
import type { ISODate } from '@/types/database';
import { buildGridWeeks, monthLabel, todayISO } from '@/utils/dates';

const DEFAULT_WEEKS = 26; // ~6 months

interface ContributionGridProps {
  completedDates: Set<ISODate>;
  color: string;
  weeks?: number;
  gap?: number;
  /** Fixed cell size; the grid scrolls horizontally. Omit to fit the container width. */
  cellSize?: number;
  showMonthLabels?: boolean;
  /** When provided, cells become tappable. */
  onToggle?: (date: ISODate) => void;
}

export function ContributionGrid({
  completedDates,
  color,
  weeks = DEFAULT_WEEKS,
  gap = 3,
  cellSize,
  showMonthLabels = false,
  onToggle,
}: ContributionGridProps) {
  const columns = useMemo(() => buildGridWeeks(weeks), [weeks]);
  const today = todayISO();
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const fitted = cellSize === undefined;
  const size = fitted ? Math.max(Math.floor((width - gap * (weeks - 1)) / weeks), 0) : cellSize;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const grid = (
    <View>
      {showMonthLabels && size > 0 && <MonthLabels columns={columns} size={size} gap={gap} />}
      <View style={[styles.row, { gap }]}>
        {columns.map((days, w) => (
          <View key={w} style={{ gap }}>
            {days.map((date, d) =>
              date === null ? (
                <View key={d} style={{ width: size, height: size }} />
              ) : (
                <Cell
                  key={date}
                  date={date}
                  size={size}
                  color={color}
                  completed={completedDates.has(date)}
                  isToday={date === today}
                  onToggle={onToggle}
                />
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );

  if (fitted) {
    return <View onLayout={onLayout}>{size > 0 && grid}</View>;
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
    >
      {grid}
    </ScrollView>
  );
}

function MonthLabels({ columns, size, gap }: { columns: (ISODate | null)[][]; size: number; gap: number }) {
  // Label a column when its first day starts a new month.
  let previous = '';
  return (
    <View style={[styles.row, { gap, marginBottom: 6, height: 14 }]}>
      {columns.map((days, w) => {
        const first = days[0];
        const label = first ? monthLabel(first) : '';
        const show = label !== '' && label !== previous;
        if (show) previous = label;
        return (
          <View key={w} style={{ width: size, overflow: 'visible' }}>
            {show && (
              <Text numberOfLines={1} style={styles.monthLabel}>
                {label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

interface CellProps {
  date: ISODate;
  size: number;
  color: string;
  completed: boolean;
  isToday: boolean;
  onToggle?: (date: ISODate) => void;
}

const Cell = memo(function Cell({ date, size, color, completed, isToday, onToggle }: CellProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  }, [completed, scale]);

  const radius = Math.min(radii.cell, Math.max(size / 4, 2));
  const cell = (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: completed ? color : colors.cellInactive,
        borderWidth: isToday && !completed ? 1 : 0,
        borderColor: withAlpha(color, 0.7),
        transform: [{ scale }],
      }}
    />
  );

  if (!onToggle) return cell;

  return (
    <Pressable
      onPress={() => onToggle(date)}
      hitSlop={2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={`${date}${isToday ? ', today' : ''}`}
    >
      {cell}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  monthLabel: { color: colors.textSubtle, fontSize: 11, width: 40 },
});
