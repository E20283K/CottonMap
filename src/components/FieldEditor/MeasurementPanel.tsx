import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../../utils/colorPalette';
import { useLanguageStore } from '../../store/useLanguageStore';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  area: number;
  perimeter: number;
  points: number;
}

export const MeasurementPanel: React.FC<Props> = ({ area, perimeter, points }) => {
  const { t } = useLanguageStore();

  return (
    <Surface style={styles.container} elevation={4}>
      <View style={styles.stat}>
        <Text variant="labelMedium" style={styles.label}>📐 {t('area')}</Text>
        <Text variant="titleMedium" style={styles.value}>
          {points >= 3 ? `${area.toFixed(2)} ha` : '—'}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text variant="labelMedium" style={styles.label}>🔲 {t('perimeter')}</Text>
        <Text variant="titleMedium" style={styles.value}>
          {points >= 2 ? (perimeter >= 1000 ? `${(perimeter / 1000).toFixed(2)} km` : `${Math.round(perimeter)} m`) : '—'}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text variant="labelMedium" style={styles.label}>📍 {t('points')}</Text>
        <Text variant="titleMedium" style={styles.value}>{points}</Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#FFF',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  value: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#EEE',
  },
});
