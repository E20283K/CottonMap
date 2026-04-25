import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { createCustomLabelImage } from '../utils/createLabelMarkerImage';

interface Props {
  label: string;
  areaHectares?: number;
  centroid: { latitude: number; longitude: number };
  color?: string;
  fieldType?: 'sector' | 'block';
  showArea?: boolean;
  onPress?: () => void;
}

export const FieldLabelMarker: React.FC<Props> = React.memo(({
  label,
  areaHectares = 0,
  centroid,
  color = '#2E7D32',
  fieldType = 'block',
  showArea = true,
  onPress,
}) => {
  const labelImage = useMemo(() => 
    createCustomLabelImage(label, `${Number(areaHectares).toFixed(1)} ha`, color, fieldType, showArea),
    [label, areaHectares, color, fieldType, showArea]
  );

  return (
    <Marker
      coordinate={centroid}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={fieldType === 'sector' ? 2000 : 1000}
      onPress={onPress}
      image={labelImage}
    >
      <View style={{ width: 0, height: 0 }} />
    </Marker>
  );
});

const styles = StyleSheet.create({});
