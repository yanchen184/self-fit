import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Switch, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from '../types';

// Import stores
import { useAppStore } from '../stores/appStore';

// Navigation prop type
type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Screen for app settings management
 */
export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { settings, updateSettings } = useAppStore();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  
  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      setIsLoading(true);
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          '通知權限',
          '無法獲得通知權限，您將不會收到運動提醒。請在設備設置中啟用通知。',
          [{ text: '了解' }]
        );
        
        // Update settings to disable notifications
        await updateSettings({ notificationsEnabled: false });
        return;
      }
      
      // Permissions granted, enable notifications
      await updateSettings({ notificationsEnabled: true });
      Alert.alert('成功', '已啟用通知');
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      Alert.alert('錯誤', '請求通知權限失敗');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle notification toggle
  const handleNotificationToggle = async (value: boolean) => {
    try {
      if (value) {
        // Request permissions when enabling
        await requestNotificationPermissions();
      } else {
        // Just update settings when disabling
        await updateSettings({ notificationsEnabled: false });
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  };
  
  // Handle reminder time change
  const handleReminderTimeChange = (minutes: number) => {
    updateSettings({ reminderTime: minutes });
  };
  
  // Handle default workout duration change
  const handleDurationChange = (minutes: number) => {
    updateSettings({ defaultWorkoutDuration: minutes });
  };
  
  // Handle week start day change
  const handleWeekStartChange = (day: 0 | 1) => {
    updateSettings({ weekStartsOn: day });
  };
  
  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };
  
  // Navigate to workout types screen
  const navigateToWorkoutTypes = () => {
    navigation.navigate('WorkoutTypes');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>
      
      <ScrollView>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>啟用提醒通知</Text>
              <Text style={styles.settingDescription}>
                在運動開始前收到推送通知
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              disabled={isLoading}
              trackColor={{ false: '#DFE3E8', true: '#BAE7FF' }}
              thumbColor={settings.notificationsEnabled ? '#1890FF' : '#F4F6F8'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>提前提醒時間</Text>
              <Text style={styles.settingDescription}>
                運動開始前多久收到通知
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.reminderTime === 15 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleReminderTimeChange(15)}
                disabled={!settings.notificationsEnabled}
              >
                <Text style={
                  settings.reminderTime === 15 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>15分鐘</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.reminderTime === 30 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleReminderTimeChange(30)}
                disabled={!settings.notificationsEnabled}
              >
                <Text style={
                  settings.reminderTime === 30 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>30分鐘</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.reminderTime === 60 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleReminderTimeChange(60)}
                disabled={!settings.notificationsEnabled}
              >
                <Text style={
                  settings.reminderTime === 60 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>1小時</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Workout Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>運動設定</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>預設運動時長</Text>
              <Text style={styles.settingDescription}>
                新增運動時的預設持續時間
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.defaultWorkoutDuration === 30 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleDurationChange(30)}
              >
                <Text style={
                  settings.defaultWorkoutDuration === 30 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>30分鐘</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.defaultWorkoutDuration === 45 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleDurationChange(45)}
              >
                <Text style={
                  settings.defaultWorkoutDuration === 45 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>45分鐘</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.defaultWorkoutDuration === 60 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleDurationChange(60)}
              >
                <Text style={
                  settings.defaultWorkoutDuration === 60 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>1小時</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={navigateToWorkoutTypes}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>運動類型管理</Text>
              <Text style={styles.settingDescription}>
                新增或編輯運動類型
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#637381" />
          </TouchableOpacity>
        </View>
        
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>顯示設定</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>每週起始日</Text>
              <Text style={styles.settingDescription}>
                日曆每週的第一天
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.weekStartsOn === 0 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleWeekStartChange(0)}
              >
                <Text style={
                  settings.weekStartsOn === 0 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>週日</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.weekStartsOn === 1 ? styles.optionButtonActive : null
                ]}
                onPress={() => handleWeekStartChange(1)}
              >
                <Text style={
                  settings.weekStartsOn === 1 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>週一</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>外觀主題</Text>
              <Text style={styles.settingDescription}>
                應用的顯示主題
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.theme === 'light' ? styles.optionButtonActive : null
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Text style={
                  settings.theme === 'light' 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>淺色</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.theme === 'dark' ? styles.optionButtonActive : null
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={
                  settings.theme === 'dark' 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>深色</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.theme === 'system' ? styles.optionButtonActive : null
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <Text style={
                  settings.theme === 'system' 
                    ? styles.optionTextActive 
                    : styles.optionText
                }>系統</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>關於</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>版本</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>開發者</Text>
            <Text style={styles.infoValue}>yanchen184</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3E8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212B36',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212B36',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#637381',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F4F6F8',
    borderRadius: 16,
    marginLeft: 8,
  },
  optionButtonActive: {
    backgroundColor: '#E6F7FF',
  },
  optionText: {
    color: '#637381',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#1890FF',
    fontWeight: '500',
    fontSize: 14,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  infoLabel: {
    fontSize: 16,
    color: '#212B36',
  },
  infoValue: {
    fontSize: 16,
    color: '#637381',
  },
});
