import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layers, ShieldCheck } from 'lucide-react-native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      // After 2.5 seconds go to the root flow
      navigation.navigate('Root' as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, [scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={[styles.bgCircle, styles.circle1]} />
      <View style={[styles.bgCircle, styles.circle2]} />

      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center', zIndex: 10 }}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoInner}>
            <Layers color="#F97316" size={48} strokeWidth={1.5} />
          </View>
          <View style={styles.badge}>
            <ShieldCheck color="#F97316" size={16} />
          </View>
        </View>

        <Text style={styles.title}>SmartHR</Text>
        <Text style={styles.subtitle}>Workspace Management System</Text>
      </Animated.View>

      <Animated.View style={[styles.loaderContainer]}>
        <ActivityIndicator size="small" color="#F97316" />
        <Text style={styles.loaderText}>Authenticating...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: '#F97316',
    top: -100,
    left: -100,
  },
  circle2: {
    width: 600,
    height: 600,
    backgroundColor: '#F97316',
    bottom: -200,
    right: -200,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',
    transform: [{ rotate: '15deg' }],
  },
  badge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  title: {
    color: '#0F172A',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: '#0F172A',
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loaderText: {
    color: '#0F172A',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
