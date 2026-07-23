import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const HAS_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

/**
 * Liquid glass kaart: blurt de aurora, met een glasrand en een subtiele
 * glans langs de bovenrand. De blur en glans liggen als absolute lagen
 * achter de children, zodat style-overrides (padding, flexDirection)
 * op de kaart zelf blijven werken.
 */
export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {HAS_BLUR && (
        <BlurView
          intensity={30}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0)']}
        style={styles.sheen}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HAS_BLUR ? 'rgba(13, 16, 42, 0.35)' : Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
  },
});
