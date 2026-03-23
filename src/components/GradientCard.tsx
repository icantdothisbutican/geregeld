import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing } from '../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

// Coherent gradient system with semantic meaning:
// - warm:  important actions, emotional content (roze/peach)
// - cool:  progress, info, calm steps (blauw/teal)
// - soft:  secondary info, backgrounds (subtle overlay)
// - glow:  highlights, CTAs, special moments (warm accent)
export const GRADIENT_PRESETS = {
  // Primary gradients - 2 colors each, soft and cohesive
  warm: ['#E8457C', '#F4845F'],       // roze > oranje - belangrijk, actie
  cool: ['#5B7FE1', '#4ECDC4'],       // blauw > teal - info, voortgang
  soft: ['#1E2235', '#1A2030'],       // donker subtiel - achtergrond, secondary
  glow: ['#F2994A', '#F2C94C'],       // warm goud - highlight, CTA

  // Subtle overlays for dark cards
  subtle: ['rgba(91, 127, 225, 0.10)', 'rgba(78, 205, 196, 0.05)'],
};

export function GradientCard({
  children,
  style,
  colors = GRADIENT_PRESETS.cool,
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
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gradient: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
});
