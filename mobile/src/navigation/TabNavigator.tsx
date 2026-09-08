import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '~/screens/Home';
import PerfilScreen from '~/screens/Perfil';
import { COLORS } from '~/styles';

import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/** Equivale ao materialBottomTabNavigator do app original (Home + Perfil). */
export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.COLOR_MAIN,
        tabBarInactiveTintColor: COLORS.GRAY,
        tabBarStyle: { backgroundColor: '#ddd' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={25} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={25} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;
