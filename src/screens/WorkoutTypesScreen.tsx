import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import types
import { RootStackParamList, WorkoutType } from '../types';

// Import stores
import { useAppStore } from '../stores/appStore';

// Navigation prop type
type WorkoutTypesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Screen for managing workout types
 */
export default function WorkoutTypesScreen() {
  const navigation = useNavigation<WorkoutTypesScreenNavigationProp>();
  const { workoutTypes, deleteWorkoutType } = useAppStore();
  
  // Navigate to edit workout type screen
  const navigateToEditType = (typeId?: string) => {
    navigation.navigate('EditWorkoutType', { typeId });
  };
  
  // Handle delete workout type
  const handleDeleteType = (type: WorkoutType) => {
    // Don't allow deletion of default types
    if (type.isDefault) {
      Alert.alert('提醒', '無法刪除預設運動類型');
      return;
    }
    
    Alert.alert(
      '確認刪除',
      `確定要刪除 "${type.name}" 運動類型嗎？此操作無法撤銷。`,
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
              await deleteWorkoutType(type.id);
              Alert.alert('成功', `已刪除 "${type.name}" 運動類型`);
            } catch (error) {
              console.error('Failed to delete workout type:', error);
              Alert.alert('錯誤', '刪除運動類型失敗，請稍後重試');
            }
          },
        },
      ]
    );
  };
  
  // Render workout type item
  const renderWorkoutTypeItem = ({ item }: { item: WorkoutType }) => (
    <View style={styles.typeItem}>
      <View style={styles.typeInfo}>
        <View 
          style={[
            styles.colorIndicator,
            { backgroundColor: item.color }
          ]} 
        />
        <Text style={styles.typeName}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>預設</Text>
          </View>
        )}
      </View>
      
      <View style={styles.typeActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigateToEditType(item.id)}
        >
          <Ionicons name="create-outline" size={20} color="#1890FF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.deleteButton,
            item.isDefault ? styles.disabledButton : null
          ]}
          onPress={() => handleDeleteType(item)}
          disabled={item.isDefault}
        >
          <Ionicons 
            name="trash-outline" 
            size={20} 
            color={item.isDefault ? '#919EAB' : '#FF4D4F'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>運動類型管理</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigateToEditType()}
      >
        <Ionicons name="add-circle" size={24} color="#1890FF" />
        <Text style={styles.addButtonText}>新增</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={workoutTypes}
        renderItem={renderWorkoutTypeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#DFE3E8" />
            <Text style={styles.emptyText}>沒有運動類型</Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={() => navigateToEditType()}
            >
              <Text style={styles.emptyAddButtonText}>新增運動類型</Text>
            </TouchableOpacity>
          </View>
        }
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
  listContent: {
    padding: 16,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
  },
  defaultBadge: {
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: '#637381',
  },
  typeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
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
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: '#1890FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
