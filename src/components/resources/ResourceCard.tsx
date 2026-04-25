import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldResource } from '../../types/resources';
import { StockProgressBar } from './StockProgressBar';

interface Props {
  resource: FieldResource;
  onPress?: () => void;
  onAddPress?: () => void;
  compact?: boolean;
}

export const ResourceCard: React.FC<Props> = ({ resource, onPress, onAddPress, compact }) => {
  const { resource_type, current_balance, low_stock_alert } = resource;
  
  // For the progress bar, we use 2x the threshold as a "soft maximum" if no max is defined
  const maxForProgress = Math.max(current_balance, resource_type.low_stock_threshold * 5);

  return (
    <Surface style={[styles.container, compact && styles.compact]} elevation={1}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={resource_type.icon as any} 
              size={24} 
              color={resource_type.color} 
            />
            <Text style={styles.name}>{resource_type.name}</Text>
          </View>
          
          <View style={styles.actions}>
            {onAddPress && (
              <IconButton 
                icon="plus-circle-outline" 
                size={20} 
                onPress={onAddPress} 
                iconColor={resource_type.color}
              />
            )}
            {low_stock_alert && (
              <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Current Stock</Text>
          <StockProgressBar 
            current={Number(current_balance)} 
            maximum={maxForProgress || 100} 
            unit={resource_type.unit} 
          />
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  compact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
