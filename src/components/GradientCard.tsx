import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing, Colors } from '../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GRADIENT_PRESETS = {
  purple: ['#2D1B69', '#1A1A2E'],
  teal: ['#0D3B3B', '#1A1A2E'],
  pink: ['#3D1B3B', '#1A1A2E'],
  purpleTeal: ['#2D1B69', '#0D3B3B'],
  pinkPurple: ['#3D1B3B', '#2D1B69'],
  tealGreen: ['#0D3B3B', '#1B3D2B'],
  warmSunset: ['#3D2B1B', '#2D1B3B'],
  accent: ['rgba(167, 139, 250, 0.2)', 'rgba(45, 212, 191, 0.1)'],
  subtle: ['rgba(167, 139, 250, 0.08)', 'rgba(45, 212, 191, 0.04)'],
};

export function GradientCard({
  children,
  style,
  colors = GRADIENT_PRESETS.purpleTeal,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
