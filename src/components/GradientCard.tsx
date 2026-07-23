import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BorderRadius, Spacing } from '../constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const HAS_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

// Liquid glass tinten: doorschijnende kleurwaas over een blur van de
// aurora, in plaats van dekkende gradients. Zelfde semantiek als eerst:
// - warm: belangrijk, actie, emotioneel (roze/oranje)
// - cool: info, voortgang, rustig (blauw/teal)
// - soft: secundair, achtergrond (donker glas)
// - glow: highlight, speciale momenten (goud)
export const GRADIENT_PRESETS = {
  warm: ['rgba(232, 69, 124, 0.34)', 'rgba(244, 132, 95, 0.22)'],
  cool: ['rgba(91, 127, 225, 0.32)', 'rgba(78, 205, 196, 0.22)'],
  soft: ['rgba(16, 20, 48, 0.40)', 'rgba(13, 16, 42, 0.30)'],
  glow: ['rgba(242, 153, 74, 0.34)', 'rgba(242, 201, 76, 0.22)'],
  subtle: ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.03)'],
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
      {HAS_BLUR ? (
        <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBase]} pointerEvents="none" />
      )}
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Glans langs de bovenrand: het "liquid glass" randlichtje */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.32)', 'rgba(255, 255, 255, 0)']}
        style={styles.sheen}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  androidBase: {
    backgroundColor: 'rgba(13, 16, 42, 0.55)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  content: {
    padding: Spacing.xl,
  },
});
