import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { LatLng } from '../../types';

interface Props {
  coordinate: LatLng;
  onPress: () => void;
}

export const MidpointHandle: React.FC<Props> = React.memo(({ coordinate, onPress }) => {
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={40}
    >
      <View style={styles.handle} />
    </Marker>
  );
});

const styles = StyleSheet.create({
  handle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    borderColor: '#000',
    borderStyle: 'dashed',
  },
});
