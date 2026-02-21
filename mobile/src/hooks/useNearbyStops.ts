/**
 * Nearby bus stops from backend API.
 * If user is far from Singapore (>50km), use Orchard as demo location.
 */
import { useState, useEffect } from 'react';
import { getNearbyBusStops } from '../services/busService';
import { distanceKm } from '../utils/distance';
import type { BusStop } from '../types/bus';
import type { LocationCoords } from './useLocation';

const NEARBY_KM = 3;
const DEMO_LOCATION = { latitude: 1.3042, longitude: 103.8321 }; // Orchard
const FAR_FROM_SG_KM = 50;

export function useNearbyStops(userLocation: LocationCoords): {
  stops: (BusStop & { distanceKm: number })[];
  loading: boolean;
  isDemoMode: boolean;
  apiError: string | null;
} {
  const [stops, setStops] = useState<(BusStop & { distanceKm: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLocation) {
      setLoading(false);
      return;
    }
    setApiError(null);
    const effectiveLoc =
      distanceKm(userLocation.latitude, userLocation.longitude, 1.35, 103.8) > FAR_FROM_SG_KM
        ? DEMO_LOCATION
        : userLocation;
    setIsDemoMode(effectiveLoc !== userLocation);

    getNearbyBusStops(effectiveLoc.latitude, effectiveLoc.longitude, NEARBY_KM)
      .then((nearby) => {
        const withDist = nearby.map((s) => ({
          ...s,
          distanceKm: distanceKm(
            effectiveLoc.latitude,
            effectiveLoc.longitude,
            s.Latitude,
            s.Longitude
          ),
        }));
        setStops(withDist);
      })
      .catch((err) => {
        setStops([]);
        const msg = err?.name === 'AbortError'
          ? 'Connection timeout. Is the backend running?'
          : (err?.message || 'Cannot reach backend. Check same Wi‑Fi and API URL.');
        setApiError(msg);
      })
      .finally(() => setLoading(false));
  }, [userLocation?.latitude, userLocation?.longitude]);

  return { stops, loading, isDemoMode, apiError };
}
