import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import stores
import { useAppStore } from './src/stores/appStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  const { initializeApp } = useAppStore();

  // Initialize app state on startup
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Register the root component
export default registerRootComponent(App);
