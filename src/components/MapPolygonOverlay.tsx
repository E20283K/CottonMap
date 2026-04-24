import React from 'react';
import { Polygon } from 'react-native-maps';
import { Field } from '../types';

interface Props {
  field: Field;
  onPress?: () => void;
}

export const MapPolygonOverlay: React.FC<Props> = ({ field, onPress }) => {
  return (
    <Polygon
      coordinates={field.polygon_json}
      fillColor={`${field.color}40`} // 40 is hex for 25% opacity
      strokeColor={field.color}
      strokeWidth={2}
      tappable
      onPress={onPress}
    />
  );
};
