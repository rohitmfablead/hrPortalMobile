// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { loginUser } from '../redux/slices/authSlice';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: reduxError } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(resultAction)) {
      setLocalError(resultAction.payload as string || 'Login failed');
    }
  };

  const displayError = localError || reduxError;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Sign In</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {displayError && <Text style={styles.error}>{displayError}</Text>}
      {loading ? <ActivityIndicator /> : <Button mode="contained" onPress={handleLogin}>Login</Button>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20, backgroundColor: '#FFFFFF' },
  title: { textAlign:'center', marginBottom:24, color: '#0F172A' },
  input: { marginBottom:12, backgroundColor: '#FFFFFF' },
  error: { color:'#f87171', marginBottom:12, textAlign:'center' },
});

export default LoginScreen;
