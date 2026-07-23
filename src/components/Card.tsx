import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Backdrop-blur werkt op iOS en web; Android valt terug op doorschijnend glas
const HAS_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

/**
 * Liquid glass kaart: blurt de aurora-achtergrond en legt er een lichte
 * glasrand omheen. De blur ligt als absolute laag achter de children,
 * zodat style-overrides (padding, flexDirection) blijven werken.
 */
export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {HAS_BLUR && (
        <BlurView
          intensity={26}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HAS_BLUR ? 'rgba(14, 17, 44, 0.38)' : Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
});
