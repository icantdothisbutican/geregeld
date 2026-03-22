import React from 'react';
import { Tabs } from 'expo-router';
import { Colors, FontSizes } from '../../src/constants/theme';
import { Text, StyleSheet } from 'react-native';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.terracotta,
        tabBarInactiveTintColor: Colors.slateMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.warmGray,
          height: 88,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="checklist"
        options={{
          title: 'Checklist',
          tabBarIcon: ({ focused }) => <TabIcon icon="✅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Gids',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacten',
          tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wishes"
        options={{
          title: 'Wensen',
          tabBarIcon: ({ focused }) => <TabIcon icon="🕯️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
