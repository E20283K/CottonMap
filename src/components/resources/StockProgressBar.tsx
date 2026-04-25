import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  current: number;
  maximum: number;
  unit: string;
  height?: number;
}

export const StockProgressBar: React.FC<Props> = ({ current, maximum, unit, height = 8 }) => {
  const percentage = Math.min(Math.max(current / maximum, 0), 1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(percentage, { damping: 15 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: progress.value > 0.5 ? '#4CAF50' : progress.value > 0.2 ? '#FF9800' : '#F44336',
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.background, { height }]}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.percentageText}>{Math.round(percentage * 100)}%</Text>
        <Text style={styles.balanceText}>{current.toFixed(1)} / {maximum} {unit}</Text>
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
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  percentageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  balanceText: {
    fontSize: 10,
    color: '#666',
  },
});
