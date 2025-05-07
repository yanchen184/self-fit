import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types';

// Import screens
import CalendarScreen from '../screens/CalendarScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddWorkoutScreen from '../screens/AddWorkoutScreen';
import EditWorkoutScreen from '../screens/EditWorkoutScreen';
import WorkoutDetailsScreen from '../screens/WorkoutDetailsScreen';
import WorkoutTypesScreen from '../screens/WorkoutTypesScreen';
import EditWorkoutTypeScreen from '../screens/EditWorkoutTypeScreen';

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1890FF',
        tabBarInactiveTintColor: '#637381',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ 
          title: '日曆',
        }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ 
          title: '統計',
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: '設定',
        }} 
      />
    </Tab.Navigator>
  );
}

// Root stack navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddWorkout" 
        component={AddWorkoutScreen} 
        options={{ title: '新增運動計畫' }} 
      />
      <Stack.Screen 
        name="EditWorkout" 
        component={EditWorkoutScreen} 
        options={{ title: '編輯運動計畫' }} 
      />
      <Stack.Screen 
        name="WorkoutDetails" 
        component={WorkoutDetailsScreen} 
        options={{ title: '運動詳情' }} 
      />
      <Stack.Screen 
        name="WorkoutTypes" 
        component={WorkoutTypesScreen} 
        options={{ title: '運動類型管理' }} 
      />
      <Stack.Screen 
        name="EditWorkoutType" 
        component={EditWorkoutTypeScreen} 
        options={({ route }) => ({ 
          title: route.params?.typeId ? '編輯運動類型' : '新增運動類型' 
        })} 
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
