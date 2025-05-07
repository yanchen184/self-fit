import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, WorkoutType } from '../types';

// Initialize default app settings
const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderTime: 30, // 30 minutes before workout
  defaultWorkoutDuration: 60, // 1 hour
  theme: 'system',
  weekStartsOn: 1, // Start week on Monday
};

// Default workout types
const DEFAULT_WORKOUT_TYPES: WorkoutType[] = [
  { id: '1', name: '慢跑', color: '#FF5733', isDefault: true },
  { id: '2', name: '有氧', color: '#33A1FF', isDefault: true },
  { id: '3', name: '瑜珈', color: '#33FF57', isDefault: true },
  { id: '4', name: '健身房', color: '#9333FF', isDefault: true },
];

// Storage keys
const SETTINGS_STORAGE_KEY = '@selffit/settings';
const WORKOUT_TYPES_STORAGE_KEY = '@selffit/workoutTypes';

// App store interface
interface AppState {
  isInitialized: boolean;
  settings: AppSettings;
  workoutTypes: WorkoutType[];
  
  // Actions
  initializeApp: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addWorkoutType: (workoutType: Omit<WorkoutType, 'id'>) => Promise<void>;
  updateWorkoutType: (id: string, updates: Partial<WorkoutType>) => Promise<void>;
  deleteWorkoutType: (id: string) => Promise<void>;
}

// Create the store
export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  settings: DEFAULT_SETTINGS,
  workoutTypes: DEFAULT_WORKOUT_TYPES,
  
  // Initialize app data from AsyncStorage
  initializeApp: async () => {
    try {
      // Load settings
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const settings = storedSettings 
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } 
        : DEFAULT_SETTINGS;
      
      // Load workout types
      const storedWorkoutTypes = await AsyncStorage.getItem(WORKOUT_TYPES_STORAGE_KEY);
      const workoutTypes = storedWorkoutTypes 
        ? JSON.parse(storedWorkoutTypes) 
        : DEFAULT_WORKOUT_TYPES;
      
      // Update store
      set({ 
        settings,
        workoutTypes,
        isInitialized: true 
      });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Fall back to defaults if loading fails
      set({ 
        settings: DEFAULT_SETTINGS,
        workoutTypes: DEFAULT_WORKOUT_TYPES,
        isInitialized: true 
      });
    }
  },
  
  // Update app settings
  updateSettings: async (newSettings: Partial<AppSettings>) => {
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // Update store
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
  
  // Add a new workout type
  addWorkoutType: async (workoutType: Omit<WorkoutType, 'id'>) => {
    try {
      const workoutTypes = get().workoutTypes;
      const newWorkoutType: WorkoutType = {
        ...workoutType,
        id: Date.now().toString(), // Generate a unique ID
      };
      
      const updatedWorkoutTypes = [...workoutTypes, newWorkoutType];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_TYPES_STORAGE_KEY, JSON.stringify(updatedWorkoutTypes));
      
      // Update store
      set({ workoutTypes: updatedWorkoutTypes });
    } catch (error) {
      console.error('Failed to add workout type:', error);
    }
  },
  
  // Update an existing workout type
  updateWorkoutType: async (id: string, updates: Partial<WorkoutType>) => {
    try {
      const workoutTypes = get().workoutTypes;
      const updatedWorkoutTypes = workoutTypes.map(type => 
        type.id === id ? { ...type, ...updates } : type
      );
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_TYPES_STORAGE_KEY, JSON.stringify(updatedWorkoutTypes));
      
      // Update store
      set({ workoutTypes: updatedWorkoutTypes });
    } catch (error) {
      console.error('Failed to update workout type:', error);
    }
  },
  
  // Delete a workout type
  deleteWorkoutType: async (id: string) => {
    try {
      const workoutTypes = get().workoutTypes;
      
      // Don't allow deletion of default workout types
      const typeToDelete = workoutTypes.find(type => type.id === id);
      if (typeToDelete?.isDefault) {
        console.warn('Cannot delete default workout type');
        return;
      }
      
      const updatedWorkoutTypes = workoutTypes.filter(type => type.id !== id);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WORKOUT_TYPES_STORAGE_KEY, JSON.stringify(updatedWorkoutTypes));
      
      // Update store
      set({ workoutTypes: updatedWorkoutTypes });
    } catch (error) {
      console.error('Failed to delete workout type:', error);
    }
  },
}));
