import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useColors, colors } from '../theme/colors';

type LoginMode = 'login' | 'register';

export function LoginSheet({ onSuccess }: { onSuccess: () => void }) {
  const colors = useColors();
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Load remember me preference
  useEffect(() => {
    const loadRememberMe = async () => {
      const stored = await AsyncStorage.getItem('rememberMe');
      if (stored === 'true') setRememberMe(true);
    };
    loadRememberMe();
  }, []);

  // Save remember me preference
  useEffect(() => {
    AsyncStorage.setItem('rememberMe', rememberMe.toString());
  }, [rememberMe]);

  const handle2FASubmit = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verify2FA(tempToken, twoFactorCode);
      const { user, access_token, refresh_token } = response;
      
      console.log('[LOGIN] 2FA verified, setting auth with user:', user);
      await setAuth(user, access_token, refresh_token);
      Alert.alert('Success', 'Welcome back to CitriCloud!');
      onSuccess();
    } catch (error: any) {
      console.error('[LOGIN] 2FA verification error:', error);
      const message = error.response?.data?.detail || error.message || 'Invalid verification code';
      Alert.alert('Error', message);
      setTwoFactorCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password required');
      return;
    }

    if (mode === 'register' && !username) {
      Alert.alert('Error', 'Username required');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (mode === 'login') {
        response = await authAPI.login(email, password);
        
        // Check if 2FA is required
        if (response.requires_2fa) {
          console.log('[LOGIN] 2FA required, temp_token:', response.temp_token);
          setRequires2FA(true);
          setTempToken(response.temp_token);
          setLoading(false);
          Alert.alert('2FA Required', 'Please enter your 6-digit authentication code from Google Authenticator');
          return;
        }
      } else {
        response = await authAPI.register(email, password, username);
      }

      const { user, access_token, refresh_token } = response;
      console.log('[LOGIN] Setting auth with user:', user);
      await setAuth(user, access_token, refresh_token);
      Alert.alert('Success', mode === 'login' ? 'Welcome back to CitriCloud!' : 'Account created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('[LOGIN] Error:', error);
      const message = error.response?.data?.detail || error.message || 'Authentication failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Show 2FA input screen if required
  if (requires2FA) {
    return (
      <Screen>
        <Card style={styles.heroCard}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Two-Factor Authentication</Text>
          <Text style={[styles.heroCopy, { color: colors.textSecondary }]}>
            Enter the 6-digit code from your Google Authenticator app
          </Text>
        </Card>

        <Card style={styles.formCard}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Authentication Code</Text>
          <TextInput
            style={[styles.input, styles.codeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="000000"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={6}
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            editable={!loading}
            autoFocus
          />
          <Text style={[styles.helperText, { color: colors.muted }]}>
            Open Google Authenticator and enter the 6-digit code for CitriCloud
          </Text>

          <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={handle2FASubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonLabel, { color: colors.background }]}>Verify Code</Text>
            )}
          </Pressable>

          <Pressable 
            style={[styles.secondaryButton, { borderColor: colors.border }]} 
            onPress={() => {
              setRequires2FA(false);
              setTempToken('');
              setTwoFactorCode('');
            }}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonLabel, { color: colors.textSecondary }]}>Back to Login</Text>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.heroCard}>
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
        <Text style={[styles.heroCopy, { color: colors.textSecondary }]}>
          {mode === 'login' ? 'Sign in to access your CitriCloud workspace.' : 'Join CitriCloud to get started.'}
        </Text>
      </Card>

      <Card style={styles.formCard}>
        {mode === 'register' && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Choose a username"
              placeholderTextColor={colors.muted}
              value={username}
              onChangeText={setUsername}
              editable={!loading}
            />
          </>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="your@email.com"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <Text style={[styles.label, { marginTop: 12, color: colors.textSecondary }]}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Enter password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Pressable 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.muted} 
            />
          </Pressable>
        </View>

        {mode === 'login' && (
          <View style={styles.loginOptions}>
            <Pressable 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, { borderColor: colors.border }]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color={colors.accent} />
                )}
              </View>
              <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://my.citricloud.com/login')}>
              <Text style={[styles.forgotPassword, { color: colors.accent }]}>Forgot password?</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.buttonLabel, { color: colors.background }]}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
          )}
        </Pressable>

        <View style={styles.toggleMode}>
          <Text style={[styles.toggleCopy, { color: colors.textSecondary }]}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} disabled={loading}>
            <Text style={[styles.toggleLink, { color: colors.accent }]}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroCopy: {
    marginTop: 8,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  loginOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonLabel: {
    fontWeight: '800',
    fontSize: 16,
  },
  toggleMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleCopy: {
  },
  toggleLink: {
    fontWeight: '700',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  secondaryButtonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
});
