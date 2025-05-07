import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TextInput, TouchableOpacity, Alert, Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types
import { RootStackParamList, WorkoutEvent } from '../types';

// Import stores
import { useWorkoutStore } from '../stores/workoutStore';
import { useAppStore } from '../stores/appStore';

// Navigation and route props
type EditWorkoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditWorkout'>;
type EditWorkoutScreenRouteProp = RouteProp<RootStackParamList, 'EditWorkout'>;

/**
 * Screen for editing existing workout events
 */
export default function EditWorkoutScreen() {
  const navigation = useNavigation<EditWorkoutScreenNavigationProp>();
  const route = useRoute<EditWorkoutScreenRouteProp>();
  const { settings, workoutTypes } = useAppStore();
  const { getWorkoutById, updateWorkout } = useWorkoutStore();
  
  // Local state
  const [workout, setWorkout] = useState<WorkoutEvent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // Date picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  
  // Load workout data
  useEffect(() => {
    const loadWorkout = async () => {
      const workoutData = getWorkoutById(route.params.eventId);
      
      if (workoutData) {
        setWorkout(workoutData);
        setTitle(workoutData.title);
        setWorkoutType(workoutData.workoutType);
        setStartDate(workoutData.start);
        setEndDate(workoutData.end);
        setLocation(workoutData.location || '');
        setNotes(workoutData.notes || '');
      }
      
      setLoading(false);
    };
    
    loadWorkout();
  }, [route.params.eventId, getWorkoutById]);
  
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
    if (!workout) return;
    
    if (!title.trim()) {
      Alert.alert('提醒', '請輸入運動標題');
      return;
    }
    
    if (!workoutType) {
      Alert.alert('提醒', '請選擇運動類型');
      return;
    }
    
    try {
      await updateWorkout(workout.id, {
        title: title.trim(),
        workoutType,
        start: startDate,
        end: endDate,
        location: location.trim(),
        notes: notes.trim(),
      });
      
      // Navigate back to workout details
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update workout:', error);
      Alert.alert('錯誤', '更新運動計畫失敗，請稍後重試');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890FF" />
      </View>
    );
  }
  
  // Not found state
  if (!workout) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#637381" />
        <Text style={styles.notFoundText}>找不到運動計畫</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
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
          <Text style={styles.submitButtonText}>更新</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: '#637381',
    marginTop: 12,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1890FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
