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
  // Warm vibrant gradients inspired by the reference images
  sunsetPink: ['#E8457C', '#F4845F', '#F7B267'],
  oceanBlue: ['#667EEA', '#64B5F6', '#4DD0E1'],
  warmSunrise: ['#F093FB', '#F5576C', '#FFC371'],
  tropicalTeal: ['#43E97B', '#38F9D7', '#4FACFE'],
  coralPeach: ['#FF9A9E', '#FECFEF', '#FBC2EB'],
  skyGradient: ['#A1C4FD', '#C2E9FB', '#667EEA'],
  warmOrange: ['#F6D365', '#FDA085', '#F5576C'],
  pinkBlue: ['#F093FB', '#667EEA', '#64B5F6'],
  candySunset: ['#FA709A', '#FEE140', '#FA709A'],
  mintFresh: ['#38F9D7', '#43E97B', '#66BB6A'],
  roseGold: ['#F5576C', '#FF9A9E', '#FECFEF'],
  deepOcean: ['#667EEA', '#764BA2', '#F093FB'],

  // Dark card variations (for dark backgrounds)
  darkWarm: ['#2A1520', '#1A1025'],
  darkOcean: ['#0F1B2D', '#0A1628'],
  darkTeal: ['#0D2420', '#0A1A18'],
  darkSunset: ['#2A1A10', '#1A1020'],

  // Subtle overlays
  accent: ['rgba(102, 126, 234, 0.15)', 'rgba(77, 208, 225, 0.08)'],
  subtle: ['rgba(240, 147, 251, 0.08)', 'rgba(102, 126, 234, 0.04)'],
};

export function GradientCard({
  children,
  style,
  colors = GRADIENT_PRESETS.oceanBlue,
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
