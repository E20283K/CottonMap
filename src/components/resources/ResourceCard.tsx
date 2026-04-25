import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldResource } from '../../types/resources';
import { StockProgressBar } from './StockProgressBar';

import { useLanguageStore } from '../../store/useLanguageStore';

interface Props {
  resource: FieldResource;
  onPress?: () => void;
  onAddPress?: () => void;
  compact?: boolean;
}

export const ResourceCard: React.FC<Props> = ({ resource, compact, onPress, onAddPress }) => {
  const { t } = useLanguageStore();
  const current = Number(resource.current_balance);
  const total = Number(resource.resource_type?.low_stock_threshold || 100) * 2; // Arbitrary for visualization
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <Surface style={[styles.container, compact && styles.compactContainer]} elevation={0}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={resource.resource_type?.icon as any || 'cube'} 
              size={22} 
              color="#000" 
            />
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.name}>{resource.resource_type?.name}</Text>
            <View style={styles.unitRow}>
              <Text style={styles.balance}>{current}</Text>
              <Text style={styles.unit}>{resource.resource_type?.unit.toUpperCase()}</Text>
            </View>
          </View>
          {onAddPress && (
            <IconButton 
              icon="plus" 
              size={20} 
              onPress={onAddPress} 
              style={styles.addBtn}
              iconColor="#000"
            />
          )}
        </View>

        {!compact && (
          <View style={styles.footer}>
            <StockProgressBar percentage={percentage} color="#000" />
            <Text style={styles.lastUpdated}>
              {t('last_updated').toUpperCase()}: {new Date(resource.last_updated).toLocaleDateString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 6,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  compactContainer: {
    padding: 12,
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  titleInfo: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.2,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  balance: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  unit: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    margin: 0,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#AAA',
    marginTop: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
