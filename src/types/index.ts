/**
 * Type definitions for the SelfFit app
 */

// Workout event type for calendar events
export interface WorkoutEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  workoutType: string;
  location?: string;
  notes?: string;
  completed: boolean | null; // null means pending, true means completed, false means missed
  createdAt: Date;
  updatedAt: Date;
}

// Workout type configuration
export interface WorkoutType {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

// App settings type
export interface AppSettings {
  notificationsEnabled: boolean;
  reminderTime: number; // Minutes before workout to send reminder
  defaultWorkoutDuration: number; // In minutes
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday, 1 is Monday, etc.
}

// Weekly stats type
export interface WeeklyStats {
  weekStartDate: Date;
  completedCount: number;
  missedCount: number;
  totalCount: number;
  totalDuration: number; // In minutes
  completionRate: number; // Percentage
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  AddWorkout: { date?: Date };
  EditWorkout: { eventId: string };
  WorkoutDetails: { eventId: string };
  Settings: undefined;
  Stats: undefined;
  WorkoutTypes: undefined;
  EditWorkoutType: { typeId?: string };
};

// Bottom tab navigation types
export type TabParamList = {
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};
