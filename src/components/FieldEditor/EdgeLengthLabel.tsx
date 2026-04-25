import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { LatLng } from '../../types';
import * as turf from '@turf/turf';

interface Props {
  p1: LatLng;
  p2: LatLng;
}

export const EdgeLengthLabel: React.FC<Props> = React.memo(({ p1, p2 }) => {
  const midpoint = useMemo(() => {
    return {
      latitude: (p1.latitude + p2.latitude) / 2,
      longitude: (p1.longitude + p2.longitude) / 2,
    };
  }, [p1, p2]);

  const length = useMemo(() => {
    const from = turf.point([p1.longitude, p1.latitude]);
    const to = turf.point([p2.longitude, p2.latitude]);
    const meters = turf.distance(from, to, { units: 'meters' });
    return meters >= 1000
      ? `${(meters / 1000).toFixed(2)} km`
      : `${Math.round(meters)} m`;
  }, [p1, p2]);

  return (
    <Marker
      coordinate={midpoint}
      anchor={{ x: 0.5, y: 0.5 }}
      pointerEvents="none"
    >
      <View style={styles.badge}>
        <Text style={styles.text}>{length}</Text>
      </View>
    </Marker>
  );
});

import { useMemo } from 'react';

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
