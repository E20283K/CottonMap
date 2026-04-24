import React from 'react';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Field } from '../types';
import { formatHectares } from '../utils/geoCalculations';
import { Colors } from '../utils/colorPalette';

interface Props {
  field: Field;
  onPress: () => void;
}

export const FieldCard: React.FC<Props> = ({ field, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{field.name}</Title>
          <Badge style={[styles.badge, { backgroundColor: field.color }]}>
            {formatHectares(field.area_hectares)} ha
          </Badge>
        </View>
        <Paragraph>Variety: {field.variety || 'N/A'}</Paragraph>
        <Paragraph>Season: {field.season || 'N/A'}</Paragraph>
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
});
