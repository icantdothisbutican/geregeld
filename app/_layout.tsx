import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/questions" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="flow/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="messages" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wishes" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
