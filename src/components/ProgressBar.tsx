import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: color || Colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
