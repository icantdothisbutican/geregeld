import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { Colors } from '../src/constants/theme';
import { AuroraBackground } from '../src/components/AuroraBackground';

// Navigatie-thema met transparante achtergrond, anders schildert de
// navigator een eigen vlak over de aurora heen
const AuroraTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: Colors.background,
  },
};

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <AuroraBackground />
      <StatusBar style="light" />
      <ThemeProvider value={AuroraTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/questions" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="flow/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="messages" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wishes" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cards" options={{ presentation: 'modal' }} />
      </Stack>
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
