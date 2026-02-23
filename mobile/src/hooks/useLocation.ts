/**
 * User location hook with heading (compass direction).
 */
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export type LocationCoords = {
  latitude: number;
  longitude: number;
} | null;

const ORCHARD_FALLBACK = { latitude: 1.3042, longitude: 103.8321 };

export function useLocation(): {
  location: LocationCoords;
  heading: number | null;
  error: string | null;
  loading: boolean;
} {
  const [location, setLocation] = useState<LocationCoords>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);

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

        if (Platform.OS !== 'web') {
          headingSubRef.current = await Location.watchHeadingAsync((h) => {
            const deg = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
            setHeading(deg);
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Location error');
        setLocation(ORCHARD_FALLBACK);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      locationSubRef.current?.remove();
      headingSubRef.current?.remove();
    };
  }, []);

  return { location, heading, error, loading };
}
