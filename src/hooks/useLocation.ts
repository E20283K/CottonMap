import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { LatLng } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Optional: Track location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLoc) => {
          setLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          });
        }
      );

      return () => subscription.remove();
    })();
  }, []);

  return { location, errorMsg };
};
