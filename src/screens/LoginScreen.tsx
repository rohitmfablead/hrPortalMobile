import CustomTextInput from '../components/CustomTextInput';
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { loginUser } from '../redux/slices/authSlice';
import { Lock, Mail } from 'lucide-react-native';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: reduxError } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    try {
      const resultAction = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.rejected.match(resultAction)) {
        setLocalError(resultAction.payload as string || 'Login failed');
      }
    } catch (err: any) {
      setLocalError(err.message || JSON.stringify(err));
    }
  };

  const displayError = localError || reduxError;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>HR</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {displayError && (
            <View style={styles.errorBadge}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <CustomTextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              outlineColor="#E2E8F0"
              activeOutlineColor="#F97316"
              textColor="#0F172A"
              left={<CustomTextInput.Icon icon={() => <Mail size={18} color="#64748B" />} />}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <CustomTextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#E2E8F0"
              activeOutlineColor="#F97316"
              textColor="#0F172A"
              left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#64748B" />} />}
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#F97316" size="large" />
            </View>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#FED7AA' },
  logoText: { fontSize: 30, fontWeight: '800', color: '#F97316', letterSpacing: 1 },
  title: { fontSize: 34, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#64748B', fontWeight: '500' },
  formContainer: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', height: 50, fontSize: 17, borderRadius: 12 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#F97316', fontWeight: '600', fontSize: 16 },
  loginBtn: { backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  loadingContainer: { paddingVertical: 16, alignItems: 'center' },
  errorBadge: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#DC2626', textAlign: 'center', fontSize: 16, fontWeight: '500' },
});

export default LoginScreen;
