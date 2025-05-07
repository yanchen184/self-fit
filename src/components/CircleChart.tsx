import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircleChartProps {
  percentage: number; // 0-100
  radius: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}

/**
 * Circular progress chart component
 * @param percentage - Percentage value (0-100)
 * @param radius - Radius of the circle
 * @param strokeWidth - Width of the progress stroke
 * @param color - Color of the progress stroke
 * @param backgroundColor - Background color of the circle
 */
const CircleChart: React.FC<CircleChartProps> = ({
  percentage,
  radius,
  strokeWidth,
  color,
  backgroundColor = '#F4F6F8'
}) => {
  // Calculate chart values
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (circumference * progressValue) / 100;
  
  // Size of the SVG container
  const size = radius * 2 + strokeWidth * 2;
  const center = size / 2;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // Rotate to start from top
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      
      {/* Percentage text in the center */}
      <View style={[styles.textContainer, { width: size, height: size }]}>
        <Text style={[styles.percentageText, { color }]}>
          {progressValue === 0 ? '-' : `${Math.round(progressValue)}%`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CircleChart;
