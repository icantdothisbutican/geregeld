import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const HAS_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Laat de aurora-achtergrond door de tab-scenes heen schijnen
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: HAS_BLUR ? 'rgba(12, 16, 46, 0.45)' : 'rgba(12, 16, 46, 0.85)',
          borderTopColor: 'rgba(255, 255, 255, 0.14)',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarBackground: HAS_BLUR
          ? () => <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          : undefined,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: 'Te Doen',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Kluis',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'lock-closed' : 'lock-closed-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
