import { useState } from 'react';
import { router } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(name, email.trim(), password);
      if (needsConfirmation) {
        setError('Check your inbox to confirm your email, then log in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start tracking in under a minute."
      error={error}
      footerText="Already have an account?"
      footerAction="Log in"
      onFooterPress={() => router.replace('/login')}
    >
      <TextField placeholder="Name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" returnKeyType="next" />
      <TextField
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        placeholder="Password (6+ characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button label="Create account" onPress={submit} loading={loading} />
    </AuthScreen>
  );
}
