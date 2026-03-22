import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSizes } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`],
          styles[`textSize_${size}`],
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.terracotta,
  },
  secondary: {
    backgroundColor: Colors.green,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.slate,
  },
  size_large: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  size_medium: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  size_small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
  },
  text_primary: {
    color: Colors.white,
  },
  text_secondary: {
    color: Colors.white,
  },
  text_outline: {
    color: Colors.slate,
  },
  textSize_large: {
    fontSize: FontSizes.large,
  },
  textSize_medium: {
    fontSize: FontSizes.body,
  },
  textSize_small: {
    fontSize: FontSizes.small,
  },
});
