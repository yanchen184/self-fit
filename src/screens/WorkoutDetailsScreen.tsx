import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types
import { RootStackParamList, WorkoutEvent } from '../types';

// Import stores
import { useWorkoutStore } from '../stores/workoutStore';
import { useAppStore } from '../stores/appStore';

// Navigation and route props
type WorkoutDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutDetails'>;
type WorkoutDetailsScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutDetails'>;

/**
 * Screen for viewing workout details and managing workout status
 */
export default function WorkoutDetailsScreen() {
  const navigation = useNavigation<WorkoutDetailsScreenNavigationProp>();
  const route = useRoute<WorkoutDetailsScreenRouteProp>();
  const { getWorkoutById, markWorkoutComplete, deleteWorkout } = useWorkoutStore();
  const { workoutTypes } = useAppStore();
  
  // Local state
  const [workout, setWorkout] = useState<WorkoutEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutColor, setWorkoutColor] = useState('#1890FF');
  
  // Load workout data
  useEffect(() => {
    const workoutData = getWorkoutById(route.params.eventId);
    
    if (workoutData) {
      setWorkout(workoutData);
      
      // Find workout type color
      const typeData = workoutTypes.find(type => type.name === workoutData.workoutType);
      if (typeData) {
        setWorkoutColor(typeData.color);
      }
    }
    
    setLoading(false);
  }, [route.params.eventId, getWorkoutById, workoutTypes]);
  
  // Handle completion status change
  const handleStatusChange = async (completed: boolean) => {
    if (!workout) return;
    
    try {
      await markWorkoutComplete(workout.id, completed);
      
      // Update local state
      setWorkout({
        ...workout,
        completed,
        updatedAt: new Date(),
      });
      
      // Show success message
      Alert.alert(
        '成功',
        completed ? '已標記為已完成' : '已標記為未完成'
      );
    } catch (error) {
      console.error('Failed to update workout status:', error);
      Alert.alert('錯誤', '更新運動狀態失敗，請稍後重試');
    }
  };
  
  // Handle edit workout
  const handleEdit = () => {
    if (!workout) return;
    navigation.navigate('EditWorkout', { eventId: workout.id });
  };
  
  // Handle delete workout
  const handleDelete = () => {
    if (!workout) return;
    
    Alert.alert(
      '確認刪除',
      '確定要刪除這個運動計畫嗎？此操作無法撤銷。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workout.id);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete workout:', error);
              Alert.alert('錯誤', '刪除運動計畫失敗，請稍後重試');
            }
          },
        },
      ]
    );
  };
  
  // Format duration for display
  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} 分鐘`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} 小時`;
    }
    
    return `${hours} 小時 ${minutes} 分鐘`;
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
      {/* Status badge */}
      <View style={styles.statusSection}>
        {workout.completed === null ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>待完成</Text>
          </View>
        ) : workout.completed ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>已完成</Text>
          </View>
        ) : (
          <View style={styles.missedBadge}>
            <Text style={styles.missedText}>未完成</Text>
          </View>
        )}
      </View>
      
      {/* Workout details card */}
      <View style={styles.detailsCard}>
        {/* Title and type */}
        <View style={styles.titleSection}>
          <View style={[styles.typeBadge, { backgroundColor: `${workoutColor}20` }]}>
            <Text style={[styles.typeText, { color: workoutColor }]}>{workout.workoutType}</Text>
          </View>
          <Text style={styles.title}>{workout.title}</Text>
        </View>
        
        {/* Time details */}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#637381" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>時間</Text>
            <Text style={styles.detailText}>
              {format(workout.start, 'yyyy年MM月dd日 HH:mm')} - {format(workout.end, 'HH:mm')}
            </Text>
            <Text style={styles.durationText}>
              持續時間: {formatDuration(workout.start, workout.end)}
            </Text>
          </View>
        </View>
        
        {/* Location (if provided) */}
        {workout.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={24} color="#637381" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>地點</Text>
              <Text style={styles.detailText}>{workout.location}</Text>
            </View>
          </View>
        )}
        
        {/* Notes (if provided) */}
        {workout.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={24} color="#637381" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>備註</Text>
              <Text style={styles.detailText}>{workout.notes}</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Action buttons */}
      <View style={styles.actionSection}>
        {workout.completed === null && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange(true)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>標記為已完成</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.incompleteButton]}
              onPress={() => handleStatusChange(false)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>標記為未完成</Text>
            </TouchableOpacity>
          </>
        )}
        
        {workout.completed !== null && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton]}
            onPress={() => Alert.alert(
              '重設狀態',
              '確定要重設此運動計劃的完成狀態嗎？',
              [
                {
                  text: '取消',
                  style: 'cancel',
                },
                {
                  text: '重設',
                  onPress: async () => {
                    try {
                      // Update workout with null completed status
                      await markWorkoutComplete(workout.id, null);
                      
                      // Update local state
                      setWorkout({
                        ...workout,
                        completed: null,
                        updatedAt: new Date(),
                      });
                    } catch (error) {
                      console.error('Failed to reset workout status:', error);
                      Alert.alert('錯誤', '重設運動狀態失敗，請稍後重試');
                    }
                  },
                },
              ]
            )}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>重設狀態</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Edit and delete section */}
      <View style={styles.managementSection}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={20} color="#1890FF" />
          <Text style={styles.editButtonText}>編輯</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4D4F" />
          <Text style={styles.deleteButtonText}>刪除</Text>
        </TouchableOpacity>
      </View>
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
  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingText: {
    color: '#FA8C16',
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#E6F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedText: {
    color: '#1890FF',
    fontWeight: '600',
  },
  missedBadge: {
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  missedText: {
    color: '#FF4D4F',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleSection: {
    marginBottom: 16,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeText: {
    fontWeight: '500',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212B36',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#637381',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#212B36',
  },
  durationText: {
    fontSize: 14,
    color: '#637381',
    marginTop: 4,
  },
  actionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#52C41A',
  },
  incompleteButton: {
    backgroundColor: '#FF4D4F',
  },
  resetButton: {
    backgroundColor: '#FA8C16',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  managementSection: {
    flexDirection: 'row',
    margin: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1890FF',
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: '#1890FF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF4D4F',
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
