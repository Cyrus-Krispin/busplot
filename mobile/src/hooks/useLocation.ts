/**
 * User location hook.
 */
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

const ORCHARD_FALLBACK = { latitude: 1.3042, longitude: 103.8321 };

export function useLocation(): {
  location: LocationCoords;
  error: string | null;
  loading: boolean;
} {
  const [location, setLocation] = useState<LocationCoords>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLocation(ORCHARD_FALLBACK);
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(pos.coords);

        locationSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2000,
            distanceInterval: 10,
          },
          (loc) => setLocation(loc.coords)
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Location error');
        setLocation(ORCHARD_FALLBACK);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      locationSubRef.current?.remove();
    };
  }, []);

  return { location, error, loading };
}
