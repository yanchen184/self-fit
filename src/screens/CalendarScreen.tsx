import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, Event } from 'react-native-big-calendar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startOfWeek, addDays, format } from 'date-fns';

// Import types
import { RootStackParamList, WorkoutEvent } from '../types';

// Import stores
import { useWorkoutStore } from '../stores/workoutStore';
import { useAppStore } from '../stores/appStore';

// Navigation prop type
type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * The main calendar screen showing the weekly view of workouts
 */
export default function CalendarScreen() {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const { workoutEvents, loadWorkouts, getWorkoutsForWeek } = useWorkoutStore();
  const { settings, workoutTypes } = useAppStore();
  
  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn })
  );
  const [displayEvents, setDisplayEvents] = useState<Event[]>([]);
  
  // Effect for loading workouts when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );
  
  // Update week start date when settings change
  useEffect(() => {
    setWeekStartDate(startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn }));
  }, [currentDate, settings.weekStartsOn]);
  
  // Convert workout events to calendar events when data changes
  useEffect(() => {
    const weekEvents = getWorkoutsForWeek(currentDate);
    
    // Transform workout events to calendar events
    const transformed = weekEvents.map(workout => {
      const workoutType = workoutTypes.find(type => type.name === workout.workoutType);
      
      return {
        id: workout.id,
        title: workout.title,
        start: workout.start,
        end: workout.end,
        color: workoutType?.color || '#1890FF',
        // Add completed status styling
        ...(workout.completed !== null && {
          style: {
            backgroundColor: workout.completed 
              ? `${workoutType?.color || '#1890FF'}80` // Add 50% transparency
              : '#E5E5E580', // Gray with transparency for missed
            borderLeftWidth: 3,
            borderLeftColor: workout.completed 
              ? workoutType?.color || '#1890FF'
              : '#999',
          }
        }),
      };
    });
    
    setDisplayEvents(transformed);
  }, [workoutEvents, workoutTypes, currentDate, getWorkoutsForWeek]);
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle event selection
  const handleEventPress = (event: Event) => {
    navigation.navigate('WorkoutDetails', { eventId: event.id as string });
  };
  
  // Handle cell press to add new workout
  const handleCellPress = (date: Date) => {
    navigation.navigate('AddWorkout', { date });
  };
  
  // Format the week display text
  const formatWeekDisplay = () => {
    const weekEnd = addDays(weekStartDate, 6);
    
    // If same month, show "Month StartDay-EndDay"
    if (weekStartDate.getMonth() === weekEnd.getMonth()) {
      return `${format(weekStartDate, 'yyyy年MM月')} ${format(weekStartDate, 'd')}-${format(weekEnd, 'd')}日`;
    }
    
    // If different months, show "StartMonth StartDay-EndMonth EndDay"
    return `${format(weekStartDate, 'yyyy年MM月d日')} - ${format(weekEnd, 'MM月d日')}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>運動日曆</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddWorkout', { date: new Date() })}
        >
          <Ionicons name="add-circle" size={24} color="#1890FF" />
          <Text style={styles.addButtonText}>新增</Text>
        </TouchableOpacity>
      </View>
      
      {/* Week navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#637381" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayText}>今天</Text>
        </TouchableOpacity>
        
        <Text style={styles.weekText}>{formatWeekDisplay()}</Text>
        
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#637381" />
        </TouchableOpacity>
      </View>
      
      {/* Calendar */}
      <Calendar
        events={displayEvents}
        height={600}
        mode="week"
        date={currentDate}
        onPressEvent={handleEventPress}
        onPressCell={handleCellPress}
        weekStartsOn={settings.weekStartsOn}
        showTime={true}
        swipeEnabled={true}
        onChangeDate={setCurrentDate}
        eventCellStyle={(event) => event.style || { backgroundColor: event.color }}
        calendarCellStyle={styles.calendarCell}
        scrollOffsetMinutes={7 * 60} // Start at 7am
        hourRowHeight={50}
        headerContainerStyle={styles.calendarHeader}
        headerStyle={styles.dayHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    color: '#1890FF',
    fontWeight: '500',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3E8',
  },
  navButton: {
    padding: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
    marginHorizontal: 16,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F4F6F8',
    borderRadius: 16,
    marginRight: 8,
  },
  todayText: {
    color: '#1890FF',
    fontWeight: '500',
    fontSize: 14,
  },
  calendarCell: {
    borderWidth: 0.5,
    borderColor: '#DFE3E8',
  },
  calendarHeader: {
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3E8',
  },
  dayHeader: {
    color: '#637381',
    fontSize: 14,
    fontWeight: '500',
  },
});
