import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// 在這裡處理NativeWind的初始化
try {
  const { NativeWindStyleSheet } = require('nativewind');
  if (NativeWindStyleSheet && typeof NativeWindStyleSheet.setOutput === 'function') {
    NativeWindStyleSheet.setOutput({
      web: 'css',
      native: 'native',
    });
  }
} catch (error) {
  console.warn('NativeWind initialization error:', error);
  // 即使NativeWind初始化失敗，也不中斷應用啟動
}

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

export default function App() {
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
