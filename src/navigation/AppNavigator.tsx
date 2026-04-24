import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MapScreen } from '../screens/MapScreen';
import { FieldsListScreen } from '../screens/FieldsListScreen';
import { FieldDetailScreen } from '../screens/FieldDetailScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors } from '../utils/colorPalette';

const Tab = createBottomTabNavigator();
const FieldsStack = createStackNavigator();

const FieldsStackNavigator = () => (
  <FieldsStack.Navigator>
    <FieldsStack.Screen name="FieldsList" component={FieldsListScreen} options={{ title: 'My Fields' }} />
    <FieldsStack.Screen name="FieldDetail" component={FieldDetailScreen} options={{ title: 'Field Details' }} />
  </FieldsStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Fields') iconName = 'land-plots';
          else if (route.name === 'Tasks') iconName = 'clipboard-check-outline';
          else if (route.name === 'Settings') iconName = 'cog';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Fields" component={FieldsStackNavigator} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ headerShown: true }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
    </Tab.Navigator>
  );
};
