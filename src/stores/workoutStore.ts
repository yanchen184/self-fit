import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { WorkoutEvent } from '../types';
import { addDays, format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useAppStore } from './appStore';

// Storage key for workout events
const WORKOUT_EVENTS_STORAGE_KEY = '@selffit/workoutEvents';

// Workout store interface
interface WorkoutState {
  workoutEvents: WorkoutEvent[];
  isLoading: boolean;
  
  // Actions
  loadWorkouts: () => Promise<void>;
  addWorkout: (workout: Omit<WorkoutEvent, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => Promise<WorkoutEvent>;
  updateWorkout: (id: string, updates: Partial<Omit<WorkoutEvent, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  markWorkoutComplete: (id: string, completed: boolean) => Promise<void>;
  getWorkoutsForWeek: (date: Date) => WorkoutEvent[];
  getWorkoutById: (id: string) => WorkoutEvent | undefined;
}

// Helper function to schedule a notification for a workout
const scheduleWorkoutNotification = async (workout: WorkoutEvent) => {
  try {
    const { settings } = useAppStore.getState();
    
    // Only schedule if notifications are enabled
    if (!settings.notificationsEnabled) {
      return;
    }
    
    // Calculate notification time (minutes before workout)
    const notificationTime = new Date(workout.start);
    notificationTime.setMinutes(notificationTime.getMinutes() - settings.reminderTime);
    
    // Skip if notification time is in the past
    if (notificationTime < new Date()) {
      return;
    }
    
    // Cancel any existing notification for this workout
    await cancelWorkoutNotification(workout.id);
    
    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '運動提醒',
        body: `${workout.title} 即將開始`,
        data: { workoutId: workout.id },
      },
      trigger: notificationTime,
      identifier: `workout-${workout.id}`,
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

// Helper function to cancel a workout notification
const cancelWorkoutNotification = async (workoutId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`workout-${workoutId}`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

// Create the store
export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workoutEvents: [],
  isLoading: false,
  
  // Load all workout events from AsyncStorage
  loadWorkouts: async () => {
    try {
      set({ isLoading: true });
      
      const storedEvents = await AsyncStorage.getItem(WORKOUT_EVENTS_STORAGE_KEY);
      if (storedEvents) {
        // Parse stored events and convert date strings back to Date objects
        const parsedEvents: WorkoutEvent[] = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        
        set({ workoutEvents: parsedEvents });
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Add a new workout event
  addWorkout: async (workout) => {
    try {
      const newWorkout: WorkoutEvent = {
        ...workout,
        id: Date.now().toString(),
        completed: null, // Pending status
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add to state
      const updatedEvents = [...get().workoutEvents, newWorkout];
      set({ workoutEvents: updatedEvents });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      
      // Schedule a notification
      await scheduleWorkoutNotification(newWorkout);
      
      return newWorkout;
    } catch (error) {
      console.error('Failed to add workout:', error);
      throw error;
    }
  },
  
  // Update an existing workout
  updateWorkout: async (id, updates) => {
    try {
      const workouts = get().workoutEvents;
      const workoutIndex = workouts.findIndex(w => w.id === id);
      
      if (workoutIndex === -1) {
        throw new Error(`Workout with id ${id} not found`);
      }
      
      // Create updated workout
      const updatedWorkout = {
        ...workouts[workoutIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      // Update the array
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      // Update state
      set({ workoutEvents: updatedWorkouts });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_EVENTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
      
      // Cancel existing notification and schedule a new one
      await cancelWorkoutNotification(id);
      await scheduleWorkoutNotification(updatedWorkout);
    } catch (error) {
      console.error('Failed to update workout:', error);
      throw error;
    }
  },
  
  // Delete a workout
  deleteWorkout: async (id) => {
    try {
      const workouts = get().workoutEvents;
      const updatedWorkouts = workouts.filter(w => w.id !== id);
      
      // Update state
      set({ workoutEvents: updatedWorkouts });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_EVENTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
      
      // Cancel notification
      await cancelWorkoutNotification(id);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error;
    }
  },
  
  // Mark a workout as complete or incomplete
  markWorkoutComplete: async (id, completed) => {
    try {
      const workouts = get().workoutEvents;
      const workoutIndex = workouts.findIndex(w => w.id === id);
      
      if (workoutIndex === -1) {
        throw new Error(`Workout with id ${id} not found`);
      }
      
      // Create updated workout
      const updatedWorkout = {
        ...workouts[workoutIndex],
        completed,
        updatedAt: new Date(),
      };
      
      // Update the array
      const updatedWorkouts = [...workouts];
      updatedWorkouts[workoutIndex] = updatedWorkout;
      
      // Update state
      set({ workoutEvents: updatedWorkouts });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_EVENTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Failed to mark workout completion:', error);
      throw error;
    }
  },
  
  // Get workouts for a specific week
  getWorkoutsForWeek: (date) => {
    try {
      const { settings } = useAppStore.getState();
      
      // Get start and end of the week based on settings
      const weekStart = startOfWeek(date, { weekStartsOn: settings.weekStartsOn });
      const weekEnd = endOfWeek(date, { weekStartsOn: settings.weekStartsOn });
      
      // Filter workouts that fall within this week
      return get().workoutEvents.filter(workout => 
        isWithinInterval(workout.start, { start: weekStart, end: weekEnd })
      );
    } catch (error) {
      console.error('Failed to get workouts for week:', error);
      return [];
    }
  },
  
  // Get a workout by ID
  getWorkoutById: (id) => {
    return get().workoutEvents.find(workout => workout.id === id);
  },
}));

// Export weekly stats calculation function
export const getWeeklyStats = (date: Date) => {
  const workouts = useWorkoutStore.getState().getWorkoutsForWeek(date);
  const { settings } = useAppStore.getState();
  
  // Get start of the week
  const weekStartDate = startOfWeek(date, { weekStartsOn: settings.weekStartsOn });
  
  // Calculate stats
  const totalCount = workouts.length;
  const completedCount = workouts.filter(w => w.completed === true).length;
  const missedCount = workouts.filter(w => w.completed === false).length;
  
  // Calculate total duration in minutes
  const totalDuration = workouts.reduce((total, workout) => {
    const durationMs = workout.end.getTime() - workout.start.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    return total + durationMinutes;
  }, 0);
  
  // Calculate completion rate
  const completedAndMissed = completedCount + missedCount;
  const completionRate = completedAndMissed > 0 
    ? (completedCount / completedAndMissed) * 100 
    : 0;
  
  return {
    weekStartDate,
    completedCount,
    missedCount,
    totalCount,
    totalDuration,
    completionRate,
  };
};
