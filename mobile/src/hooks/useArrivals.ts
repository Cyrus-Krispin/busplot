/**
 * Bus arrivals for a stop.
 */
import { useState, useEffect } from 'react';
import { getArrivalsForStop } from '../services/busService';
import type { BusServiceArrival } from '../types/bus';

export function useArrivals(busStopCode: string | null): {
  arrivals: BusServiceArrival[];
  loading: boolean;
} {
  const [arrivals, setArrivals] = useState<BusServiceArrival[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!busStopCode) {
      setArrivals([]);
      return;
    }
    setLoading(true);
    getArrivalsForStop(busStopCode)
      .then(setArrivals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [busStopCode]);

  return { arrivals, loading };
}
