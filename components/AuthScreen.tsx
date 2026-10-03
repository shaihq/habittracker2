import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface AuthScreenProps {
  title: string;
  subtitle: string;
  error: string | null;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
  children: ReactNode;
}

/** Shared shell for the Login and Sign Up screens. */
export function AuthScreen({ title, subtitle, error, footerText, footerAction, onFooterPress, children }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>HabitKit</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>
            {children}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{footerText}</Text>
            <Pressable onPress={onFooterPress} hitSlop={8} accessibilityRole="link">
              <Text style={styles.footerAction}>{footerAction}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xxl },
  brand: { gap: spacing.sm },
  logo: { color: colors.textMuted, fontSize: 15, fontWeight: '600', letterSpacing: 0.5, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.8, lineHeight: 38 },
  subtitle: { color: colors.textMuted, fontSize: 16 },
  form: { gap: spacing.lg },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { color: colors.textMuted, fontSize: 15 },
  footerAction: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
