import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { IconButton } from 'react-native-paper';
import { MapScreen } from '../screens/MapScreen';
import { FieldsListScreen } from '../screens/FieldsListScreen';
import { FieldDetailScreen } from '../screens/FieldDetailScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useLanguageStore } from '../store/useLanguageStore';
import { Colors } from '../utils/colorPalette';

import { ResourcesDashboardScreen } from '../screens/resources/ResourcesDashboardScreen';
import { ResourcesFieldScreen } from '../screens/resources/ResourcesFieldScreen';
import { ResourceDetailScreen } from '../screens/resources/ResourceDetailScreen';
import { ResourceTypesScreen } from '../screens/resources/ResourceTypesScreen';

const Tab = createBottomTabNavigator();
const FieldsStack = createStackNavigator();
const ResourcesStack = createStackNavigator();
const TasksStack = createStackNavigator();
const SettingsStack = createStackNavigator();

const commonStackOptions = {
  headerStyle: {
    backgroundColor: '#FFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitleStyle: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  headerTintColor: '#000',
  headerTitleAlign: 'left' as const,
};

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

const FieldsStackNavigator = () => {
  const { t } = useLanguageStore();
  return (
    <FieldsStack.Navigator screenOptions={commonStackOptions}>
      <FieldsStack.Screen name="FieldsList" component={FieldsListScreen} options={{ title: t('my_fields') }} />
      <FieldsStack.Screen name="FieldDetail" component={FieldDetailScreen} options={{ title: t('field_details') }} />
    </FieldsStack.Navigator>
  );
};

const ResourcesStackNavigator = () => {
  const { t } = useLanguageStore();
  return (
    <ResourcesStack.Navigator screenOptions={commonStackOptions}>
      <ResourcesStack.Screen 
        name="ResourcesDashboard" 
        component={ResourcesDashboardScreen} 
        options={({ navigation }) => ({ 
          title: t('resources'),
          headerRight: () => (
            <IconButton 
              icon="format-list-bulleted" 
              onPress={() => navigation.navigate('ResourceTypes')} 
              iconColor="#000" 
            />
          )
        })} 
      />
      <ResourcesStack.Screen name="ResourcesField" component={ResourcesFieldScreen} options={{ title: t('field_resources') }} />
      <ResourcesStack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: t('history') }} />
      <ResourcesStack.Screen name="ResourceTypes" component={ResourceTypesScreen} options={{ title: t('manage_types') }} />
    </ResourcesStack.Navigator>
  );
};

const TasksStackNavigator = () => {
  const { t } = useLanguageStore();
  return (
    <TasksStack.Navigator screenOptions={commonStackOptions}>
      <TasksStack.Screen 
        name="TasksList" 
        component={TasksScreen} 
        options={{ title: t('tasks') }} 
      />
      <TasksStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: t('task_details') }} 
      />
    </TasksStack.Navigator>
  );
};

const SettingsStackNavigator = () => {
  const { t } = useLanguageStore();
  return (
    <SettingsStack.Navigator screenOptions={commonStackOptions}>
      <SettingsStack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ title: t('settings') }} 
      />
    </SettingsStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { t } = useLanguageStore();
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
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: t('map') }} />
      <Tab.Screen name="Fields" component={FieldsStackNavigator} options={{ tabBarLabel: t('fields') }} />
      <Tab.Screen name="Tasks" component={TasksStackNavigator} options={{ tabBarLabel: t('tasks') }} />
      <Tab.Screen name="Resources" component={ResourcesStackNavigator} options={{ tabBarLabel: t('resources') }} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ tabBarLabel: t('settings') }} />
    </Tab.Navigator>
  );
};
