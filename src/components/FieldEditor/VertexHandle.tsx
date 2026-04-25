import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { LatLng } from '../../types';
import { Colors } from '../../utils/colorPalette';

interface Props {
  coordinate: LatLng;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  onDragEnd: (coordinate: LatLng) => void;
  onPress: () => void;
}

export const VertexHandle: React.FC<Props> = React.memo(({ coordinate, index, isSelected, isFirst, onDragEnd, onPress }) => {
  return (
    <Marker
      coordinate={coordinate}
      draggable
      onDragEnd={(e) => onDragEnd(e.nativeEvent.coordinate)}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isSelected ? 100 : 50}
    >
      <View style={[
        styles.handle,
        isSelected && styles.selectedHandle,
        isFirst && styles.firstHandle
      ]} />
    </Marker>
  );
});

const styles = StyleSheet.create({
  handle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedHandle: {
    backgroundColor: '#000',
    borderColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  firstHandle: {
    borderColor: '#000',
    borderWidth: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
