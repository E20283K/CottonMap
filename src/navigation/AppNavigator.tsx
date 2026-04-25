import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { MapScreen } from '../screens/MapScreen';
import { FieldsListScreen } from '../screens/FieldsListScreen';
import { FieldDetailScreen } from '../screens/FieldDetailScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors } from '../utils/colorPalette';

import { ResourcesDashboardScreen } from '../screens/resources/ResourcesDashboardScreen';
import { ResourcesFieldScreen } from '../screens/resources/ResourcesFieldScreen';
import { ResourceDetailScreen } from '../screens/resources/ResourceDetailScreen';
import { ResourceTypesScreen } from '../screens/resources/ResourceTypesScreen';

const Tab = createBottomTabNavigator();
const FieldsStack = createStackNavigator();
const ResourcesStack = createStackNavigator();

const TabIcon = ({ name, color, size, focused }: any) => {
  const [scale] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.25,
          useNativeDriver: true,
          tension: 40,
          friction: 3,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 3,
        }),
      ]).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </Animated.View>
  );
};

const FieldsStackNavigator = () => (
  <FieldsStack.Navigator>
    <FieldsStack.Screen name="FieldsList" component={FieldsListScreen} options={{ title: 'My Fields' }} />
    <FieldsStack.Screen name="FieldDetail" component={FieldDetailScreen} options={{ title: 'Field Details' }} />
  </FieldsStack.Navigator>
);

const ResourcesStackNavigator = () => (
  <ResourcesStack.Navigator>
    <ResourcesStack.Screen name="ResourcesDashboard" component={ResourcesDashboardScreen} options={{ title: 'Resources' }} />
    <ResourcesStack.Screen name="ResourcesField" component={ResourcesFieldScreen} options={{ title: 'Field Resources' }} />
    <ResourcesStack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: 'History' }} />
    <ResourcesStack.Screen name="ResourceTypes" component={ResourceTypesScreen} options={{ title: 'Manage Types' }} />
  </ResourcesStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Fields') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          return <TabIcon name={iconName} size={size} color={color} focused={focused} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Fields" component={FieldsStackNavigator} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ headerShown: true }} />
      <Tab.Screen name="Resources" component={ResourcesStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
    </Tab.Navigator>
  );
};
