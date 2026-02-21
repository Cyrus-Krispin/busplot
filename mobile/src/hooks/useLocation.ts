/**
 * User location hook.
 */
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

export function useLocation(): {
  location: LocationCoords;
  error: string | null;
  loading: boolean;
} {
  const [location, setLocation] = useState<LocationCoords>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLocation({ latitude: 1.3042, longitude: 103.8321 }); // Orchard fallback for demo
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(pos.coords);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Location error');
        setLocation({ latitude: 1.3042, longitude: 103.8321 }); // Orchard fallback for demo
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
}
