import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  percentage: number;
  color?: string;
  height?: number;
}

export const StockProgressBar: React.FC<Props> = ({ percentage, color = '#000', height = 4 }) => {
  const normPercentage = Math.min(Math.max(percentage, 0), 100);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(normPercentage / 100, { 
      damping: 20,
      stiffness: 90 
    });
  }, [normPercentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.background}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  background: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 10,
  },
});
