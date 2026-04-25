import React from 'react';
import { Card, Title, Paragraph, Badge, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Field } from '../types';
import { formatHectares } from '../utils/geoCalculations';
import { Colors } from '../utils/colorPalette';
import { useFieldsStore } from '../store/useFieldsStore';

interface Props {
  field: Field;
  onPress: () => void;
}

export const FieldCard: React.FC<Props> = ({ field, onPress }) => {
  const fields = useFieldsStore((state) => state.fields);
  const parentSector = field.parent_id 
    ? fields.find(f => f.id === field.parent_id) 
    : null;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Badge 
              style={[
                styles.typeBadge, 
                { backgroundColor: field.field_type === 'sector' ? Colors.field.sector : Colors.field.block }
              ]}
            >
              {field.field_type.toUpperCase()}
            </Badge>
            <Title style={styles.title}>{field.label || field.name}</Title>
          </View>
          <Badge style={[styles.badge, { backgroundColor: field.color }]}>
            {formatHectares(field.area_hectares)} ha
          </Badge>
        </View>
        {parentSector && (
          <Paragraph style={styles.parentText}>↳ Inside Sector: {parentSector.name}</Paragraph>
        )}
        <Paragraph>Variety: {field.variety || 'N/A'} • Season: {field.season || 'N/A'}</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    marginRight: 8,
    alignSelf: 'center',
    paddingHorizontal: 6,
  },
  title: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    fontSize: 14,
    height: 24,
    color: '#FFF',
  },
  parentText: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
});

