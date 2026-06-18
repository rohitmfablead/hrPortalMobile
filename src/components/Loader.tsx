import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export default function Loader({ size = 'large', color = '#F97316', message = 'Loading...' }: LoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.loaderContainer}>
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <Sparkles color={color} size={40} strokeWidth={1.5} />
      </Animated.View>
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size={size} color={color} />
        {message ? <Text style={[styles.message, { color }]}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconWrapper: {
    marginBottom: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    padding: 16,
    borderRadius: 30,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  message: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
