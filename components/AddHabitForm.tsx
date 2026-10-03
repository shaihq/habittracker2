import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, defaultHabitColor, habitColors, radii, spacing } from '@/constants/theme';
import type { HabitInput } from '@/types/database';
import { frequencyOptions } from '@/utils/streaks';
import { Button } from './Button';
import { TextField } from './TextField';

interface AddHabitFormProps {
  initialValues?: HabitInput;
  submitLabel: string;
  onSubmit: (values: HabitInput) => Promise<void>;
}

export function AddHabitForm({ initialValues, submitLabel, onSubmit }: AddHabitFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [frequency, setFrequency] = useState(initialValues?.frequency ?? 'daily');
  const [color, setColor] = useState(initialValues?.color ?? defaultHabitColor);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setError('Give your habit a name.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || null, frequency, color });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextField label="Name" placeholder="Reading" value={name} onChangeText={setName} autoFocus={!initialValues} returnKeyType="next" maxLength={40} />
      <TextField
        label="Description (optional)"
        placeholder="Read for 15 minutes"
        value={description}
        onChangeText={setDescription}
        maxLength={80}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.segmented}>
          {frequencyOptions.map((option) => {
            const selected = option.value === frequency;
            return (
              <Pressable
                key={option.value}
                onPress={() => setFrequency(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.segment, selected && styles.segmentSelected]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.swatches}>
          {habitColors.map((c) => {
            const selected = c.value === color;
            return (
              <Pressable
                key={c.value}
                onPress={() => setColor(c.value)}
                accessibilityRole="radio"
                accessibilityLabel={c.name}
                accessibilityState={{ selected }}
                style={[styles.swatch, { backgroundColor: c.value }]}
              >
                {selected && <Check size={18} strokeWidth={3} color={colors.onPrimary} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label={submitLabel} onPress={submit} loading={submitting} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  section: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.input,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, height: 40, borderRadius: radii.input - 4, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.cardElevated },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  segmentTextSelected: { color: colors.text },
  swatches: { flexDirection: 'row', gap: spacing.md },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, fontSize: 14 },
  submit: { marginTop: spacing.sm },
});
