import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, Alert, ScrollView 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import types
import { RootStackParamList } from '../types';

// Import stores
import { useAppStore } from '../stores/appStore';

// Navigation and route props
type EditWorkoutTypeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditWorkoutType'>;
type EditWorkoutTypeScreenRouteProp = RouteProp<RootStackParamList, 'EditWorkoutType'>;

// Predefined colors for selection
const COLORS = [
  '#FF5733', // Red Orange
  '#FF8C00', // Dark Orange
  '#FFC300', // Yellow
  '#32CD32', // Lime Green
  '#3CB371', // Medium Sea Green
  '#20B2AA', // Light Sea Green
  '#87CEEB', // Sky Blue
  '#4169E1', // Royal Blue
  '#9370DB', // Medium Purple
  '#FF69B4', // Hot Pink
  '#CD5C5C', // Indian Red
  '#556B2F', // Dark Olive Green
];

/**
 * Screen for adding or editing a workout type
 */
export default function EditWorkoutTypeScreen() {
  const navigation = useNavigation<EditWorkoutTypeScreenNavigationProp>();
  const route = useRoute<EditWorkoutTypeScreenRouteProp>();
  const { workoutTypes, addWorkoutType, updateWorkoutType } = useAppStore();
  
  // Get workout type ID from route params
  const typeId = route.params?.typeId;
  const isEditing = !!typeId;
  
  // Find existing workout type if editing
  const existingType = isEditing 
    ? workoutTypes.find(type => type.id === typeId) 
    : null;
  
  // Form state
  const [name, setName] = useState(existingType?.name || '');
  const [color, setColor] = useState(existingType?.color || COLORS[0]);
  
  // Validate if name is unique (except for current type)
  const isNameUnique = (typeName: string) => {
    return !workoutTypes.some(type => 
      type.name === typeName && type.id !== typeId
    );
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('提醒', '請輸入運動類型名稱');
      return;
    }
    
    // Check if name is unique
    if (!isNameUnique(name)) {
      Alert.alert('提醒', '此運動類型名稱已存在，請使用其他名稱');
      return;
    }
    
    try {
      if (isEditing && existingType) {
        // Update existing workout type
        await updateWorkoutType(typeId, {
          name: name.trim(),
          color,
        });
        Alert.alert('成功', '運動類型已更新');
      } else {
        // Add new workout type
        await addWorkoutType({
          name: name.trim(),
          color,
          isDefault: false,
        });
        Alert.alert('成功', '運動類型已新增');
      }
      
      // Navigate back to workout types screen
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save workout type:', error);
      Alert.alert('錯誤', '保存運動類型失敗，請稍後重試');
    }
  };
  
  // Render color option
  const renderColorOption = (colorValue: string) => (
    <TouchableOpacity
      key={colorValue}
      style={[
        styles.colorOption,
        { backgroundColor: colorValue },
        color === colorValue ? styles.colorOptionSelected : null
      ]}
      onPress={() => setColor(colorValue)}
    >
      {color === colorValue && (
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Type name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>運動類型名稱</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例如：游泳、跳繩"
            placeholderTextColor="#919EAB"
            editable={!existingType?.isDefault}
          />
          {existingType?.isDefault && (
            <Text style={styles.helperText}>
              預設運動類型名稱無法修改
            </Text>
          )}
        </View>
        
        {/* Color selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>顏色</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(renderColorOption)}
          </View>
        </View>
        
        {/* Preview */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>預覽</Text>
          <View style={styles.previewContainer}>
            <View 
              style={[
                styles.previewColor,
                { backgroundColor: color }
              ]} 
            />
            <Text style={styles.previewText}>{name || '運動類型'}</Text>
          </View>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? '更新' : '新增'}
          </Text>
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
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
  helperText: {
    fontSize: 14,
    color: '#637381',
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFE3E8',
  },
  previewColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212B36',
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
