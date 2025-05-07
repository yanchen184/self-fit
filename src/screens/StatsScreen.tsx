import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  addWeeks,
  isWithinInterval 
} from 'date-fns';

// Import types
import { WorkoutEvent } from '../types';

// Import stores
import { useWorkoutStore, getWeeklyStats } from '../stores/workoutStore';
import { useAppStore } from '../stores/appStore';

// Import CircleChart component
import CircleChart from '../components/CircleChart';

const { width } = Dimensions.get('window');

/**
 * Screen showing workout statistics and progress
 */
export default function StatsScreen() {
  const { workoutEvents } = useWorkoutStore();
  const { settings } = useAppStore();
  
  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStats, setWeekStats] = useState(getWeeklyStats(currentDate));
  const [weekWorkouts, setWeekWorkouts] = useState<WorkoutEvent[]>([]);
  
  // Update stats when date or workouts change
  useEffect(() => {
    const stats = getWeeklyStats(currentDate);
    setWeekStats(stats);
    
    // Get workouts within this week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    
    // Filter workouts for this week
    const filteredWorkouts = workoutEvents.filter(workout => 
      isWithinInterval(workout.start, { start: weekStart, end: weekEnd })
    );
    
    // Sort by date (newest first)
    const sortedWorkouts = [...filteredWorkouts].sort(
      (a, b) => b.start.getTime() - a.start.getTime()
    );
    
    setWeekWorkouts(sortedWorkouts);
  }, [currentDate, workoutEvents, settings.weekStartsOn]);
  
  // Go to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // Go to next week
  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };
  
  // Format week display text
  const formatWeekDisplay = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    
    // If same month, show "Month StartDay-EndDay"
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${format(weekStart, 'yyyy年MM月')} ${format(weekStart, 'd')}-${format(weekEnd, 'd')}日`;
    }
    
    // If different months, show "StartMonth StartDay-EndMonth EndDay"
    return `${format(weekStart, 'yyyy年MM月d日')} - ${format(weekEnd, 'MM月d日')}`;
  };
  
  // Format time duration (minutes to hours and minutes)
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分鐘`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (remainingMinutes === 0) {
      return `${hours} 小時`;
    }
    
    return `${hours} 小時 ${remainingMinutes} 分鐘`;
  };
  
  // Determine workout status icon and color
  const getWorkoutStatusIcon = (workout: WorkoutEvent) => {
    if (workout.completed === null) {
      return { 
        name: 'time-outline',
        color: '#FA8C16',
        text: '待完成'
      };
    } else if (workout.completed) {
      return { 
        name: 'checkmark-circle',
        color: '#52C41A',
        text: '已完成'
      };
    } else {
      return { 
        name: 'close-circle',
        color: '#FF4D4F',
        text: '未完成'
      };
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>運動統計</Text>
      </View>
      
      {/* Week selection */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#637381" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToCurrentWeek} style={styles.todayButton}>
          <Text style={styles.todayText}>本週</Text>
        </TouchableOpacity>
        
        <Text style={styles.weekText}>{formatWeekDisplay()}</Text>
        
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#637381" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Stats cards */}
        <View style={styles.statsCardsContainer}>
          {/* Completion rate */}
          <View style={styles.statCard}>
            <CircleChart 
              percentage={weekStats.completionRate}
              radius={50}
              strokeWidth={10}
              color="#1890FF"
            />
            <Text style={styles.statTitle}>完成率</Text>
            <Text style={styles.statValue}>
              {weekStats.completionRate === 0 && weekStats.totalCount === 0
                ? '-'
                : `${Math.round(weekStats.completionRate)}%`}
            </Text>
          </View>
          
          {/* Total workouts */}
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={40} color="#1890FF" />
            </View>
            <Text style={styles.statTitle}>運動計畫</Text>
            <Text style={styles.statValue}>{weekStats.totalCount} 次</Text>
          </View>
          
          {/* Total duration */}
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={40} color="#1890FF" />
            </View>
            <Text style={styles.statTitle}>總時長</Text>
            <Text style={styles.statValue}>
              {formatDuration(Math.round(weekStats.totalDuration))}
            </Text>
          </View>
        </View>
        
        {/* Detailed stats */}
        <View style={styles.detailedStats}>
          <View style={styles.detailedStatsHeader}>
            <Text style={styles.detailedStatsTitle}>運動詳情</Text>
          </View>
          
          <View style={styles.detailedStatsRow}>
            <View style={styles.detailedStatItem}>
              <Text style={styles.detailedStatLabel}>已完成</Text>
              <Text style={[styles.detailedStatValue, { color: '#52C41A' }]}>
                {weekStats.completedCount}
              </Text>
            </View>
            
            <View style={styles.detailedStatItem}>
              <Text style={styles.detailedStatLabel}>未完成</Text>
              <Text style={[styles.detailedStatValue, { color: '#FF4D4F' }]}>
                {weekStats.missedCount}
              </Text>
            </View>
            
            <View style={styles.detailedStatItem}>
              <Text style={styles.detailedStatLabel}>待完成</Text>
              <Text style={[styles.detailedStatValue, { color: '#FA8C16' }]}>
                {weekStats.totalCount - weekStats.completedCount - weekStats.missedCount}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Workout list */}
        <View style={styles.workoutListContainer}>
          <Text style={styles.workoutListTitle}>本週運動列表</Text>
          
          {weekWorkouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={64} color="#DFE3E8" />
              <Text style={styles.emptyText}>本週尚無運動計畫</Text>
            </View>
          ) : (
            weekWorkouts.map((workout) => {
              const statusInfo = getWorkoutStatusIcon(workout);
              
              return (
                <View key={workout.id} style={styles.workoutItem}>
                  <View style={styles.workoutItemHeader}>
                    <Text style={styles.workoutItemDate}>
                      {format(workout.start, 'MM月dd日')}
                    </Text>
                    <View style={styles.workoutItemStatus}>
                      <Ionicons name={statusInfo.name as any} size={16} color={statusInfo.color} />
                      <Text style={[styles.workoutItemStatusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.workoutItemTitle}>
                    {workout.title}
                  </Text>
                  
                  <View style={styles.workoutItemDetails}>
                    <View style={styles.workoutItemTime}>
                      <Ionicons name="time-outline" size={14} color="#637381" />
                      <Text style={styles.workoutItemTimeText}>
                        {format(workout.start, 'HH:mm')} - {format(workout.end, 'HH:mm')}
                      </Text>
                    </View>
                    
                    {workout.location && (
                      <View style={styles.workoutItemLocation}>
                        <Ionicons name="location-outline" size={14} color="#637381" />
                        <Text style={styles.workoutItemLocationText}>{workout.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
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
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 48) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#637381',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212B36',
    marginTop: 4,
  },
  detailedStats: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailedStatsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3E8',
    padding: 16,
  },
  detailedStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212B36',
  },
  detailedStatsRow: {
    flexDirection: 'row',
    padding: 16,
  },
  detailedStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailedStatLabel: {
    fontSize: 14,
    color: '#637381',
    marginBottom: 8,
  },
  detailedStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutListContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212B36',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#637381',
  },
  workoutItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3E8',
    paddingVertical: 12,
  },
  workoutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutItemDate: {
    fontSize: 14,
    color: '#637381',
  },
  workoutItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutItemStatusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  workoutItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
    marginBottom: 8,
  },
  workoutItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutItemTimeText: {
    fontSize: 14,
    color: '#637381',
    marginLeft: 4,
  },
  workoutItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutItemLocationText: {
    fontSize: 14,
    color: '#637381',
    marginLeft: 4,
  },
});
