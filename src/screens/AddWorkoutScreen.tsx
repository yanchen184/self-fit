import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TextInput, TouchableOpacity, Alert, Platform 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addMinutes, format } from 'date-fns';

// Import types
import { RootStackParamList } from '../types';

// Import stores
import { useWorkoutStore } from '../stores/workoutStore';
import { useAppStore } from '../stores/appStore';

// Navigation and route props
type AddWorkoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddWorkout'>;
type AddWorkoutScreenRouteProp = RouteProp<RootStackParamList, 'AddWorkout'>;

/**
 * Screen for adding a new workout to the calendar
 */
export default function AddWorkoutScreen() {
  const navigation = useNavigation<AddWorkoutScreenNavigationProp>();
  const route = useRoute<AddWorkoutScreenRouteProp>();
  const { settings, workoutTypes } = useAppStore();
  const { addWorkout } = useWorkoutStore();
  
  // Initial date from route params or current date
  const initialDate = route.params?.date || new Date();
  
  // Form state
  const [title, setTitle] = useState('');
  const [workoutType, setWorkoutType] = useState(workoutTypes[0]?.name || '');
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(addMinutes(initialDate, settings.defaultWorkoutDuration));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // Date picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  
  // Initialize title based on workout type
  useEffect(() => {
    if (workoutType && !title) {
      setTitle(workoutType);
    }
  }, [workoutType, title]);
  
  // Handle start date change
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      // Create a new date with the selected values
      const newStartDate = new Date(selectedDate);
      setStartDate(newStartDate);
      
      // Update end date to maintain duration
      const duration = endDate.getTime() - startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      setEndDate(newEndDate);
    }
  };
  
  // Handle end date change
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      // Ensure end date is after start date
      if (selectedDate.getTime() <= startDate.getTime()) {
        Alert.alert('提醒', '結束時間必須晚於開始時間');
        return;
      }
      
      setEndDate(selectedDate);
    }
  };
  
  // Show date picker
  const showDatePicker = (forStart: boolean, mode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setPickerMode(mode);
    }
    
    if (forStart) {
      setShowStartPicker(true);
    } else {
      setShowEndPicker(true);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日');
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  
  // Calculate workout duration in minutes
  const getDurationMinutes = () => {
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('提醒', '請輸入運動標題');
      return;
    }
    
    if (!workoutType) {
      Alert.alert('提醒', '請選擇運動類型');
      return;
    }
    
    try {
      await addWorkout({
        title: title.trim(),
        workoutType,
        start: startDate,
        end: endDate,
        location: location.trim(),
        notes: notes.trim(),
      });
      
      // Navigate back to calendar
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add workout:', error);
      Alert.alert('錯誤', '新增運動計畫失敗，請稍後重試');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>運動標題</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="例如：慢跑"
            placeholderTextColor="#919EAB"
          />
        </View>
        
        {/* Workout Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>運動類型</Text>
          <TouchableOpacity 
            style={styles.selector}
            onPress={() => {
              // Show workout type selection modal or inline picker
              // For MVP, just cycle through workout types
              const currentIndex = workoutTypes.findIndex(type => type.name === workoutType);
              const nextIndex = (currentIndex + 1) % workoutTypes.length;
              setWorkoutType(workoutTypes[nextIndex].name);
            }}
          >
            <Text style={styles.selectorText}>{workoutType}</Text>
            <Ionicons name="chevron-forward" size={24} color="#637381" />
          </TouchableOpacity>
        </View>
        
        {/* Start Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>開始時間</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => showDatePicker(true, 'date')}
            >
              <Ionicons name="calendar-outline" size={20} color="#637381" />
              <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => showDatePicker(true, 'time')}
            >
              <Ionicons name="time-outline" size={20} color="#637381" />
              <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* End Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>結束時間</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => showDatePicker(false, 'date')}
            >
              <Ionicons name="calendar-outline" size={20} color="#637381" />
              <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => showDatePicker(false, 'time')}
            >
              <Ionicons name="time-outline" size={20} color="#637381" />
              <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Duration (calculated) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>持續時間</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{getDurationMinutes()} 分鐘</Text>
          </View>
        </View>
        
        {/* Location (optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>地點（選填）</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="例如：公園、健身房"
            placeholderTextColor="#919EAB"
          />
        </View>
        
        {/* Notes (optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>備註（選填）</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="其他備註..."
            placeholderTextColor="#919EAB"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
      
      {/* Date Pickers (iOS) */}
      {Platform.OS === 'ios' && (
        <>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode={pickerMode}
              display="default"
              onChange={handleStartDateChange}
            />
          )}
          
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode={pickerMode}
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </>
      )}
      
      {/* Date Pickers (Android) */}
      {Platform.OS === 'android' && (
        <>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode={pickerMode}
              display="default"
              onChange={handleStartDateChange}
            />
          )}
          
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode={pickerMode}
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212B36',
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#212B36',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#212B36',
  },
  durationContainer: {
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: 8,
    padding: 12,
  },
  durationText: {
    fontSize: 16,
    color: '#212B36',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#1890FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
