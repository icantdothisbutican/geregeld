import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSizes } from '../constants/theme';

interface ChoiceButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ChoiceButton({ label, selected, onPress }: ChoiceButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 130,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  text: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedText: {
    color: Colors.primary,
  },
});
