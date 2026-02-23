/**
 * Fetches nearby bus stops for a map center point.
 * Refetches when center or radius changes (e.g. user pans/zooms the map).
 */
import { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { getNearbyBusStops } from '../services/busService';
import { distanceKm } from '../utils/distance';
import { MAX_MAP_MARKERS } from '../constants/map';
import type { BusStop } from '../types/bus';

export function useMapStops(
  centerLat: number | null,
  centerLng: number | null,
  radiusKm: number
): {
  stops: (BusStop & { distanceKm: number })[];
  loading: boolean;
  error: string | null;
} {
  const [stops, setStops] = useState<(BusStop & { distanceKm: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (centerLat == null || centerLng == null) {
      setStops([]);
      return;
    }
    setLoading(true);
    setError(null);
    getNearbyBusStops(centerLat, centerLng, radiusKm)
      .then((nearby) => {
        if (cancelled) return;
        const withDist = nearby
          .map((s) => ({
            ...s,
            distanceKm: distanceKm(centerLat, centerLng, s.Latitude, s.Longitude),
          }))
          .slice(0, MAX_MAP_MARKERS);
        InteractionManager.runAfterInteractions(() => {
          if (!cancelled) setStops(withDist);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setStops([]);
        setError(err?.message || 'Failed to load stops');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [centerLat, centerLng, radiusKm]);

  return { stops, loading, error };
}
