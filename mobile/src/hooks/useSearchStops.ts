/**
 * Debounced search hook for bus stops by code, name, or road.
 */
import { useState, useEffect } from 'react';
import { searchBusStops } from '../services/api';
import type { BusStop } from '../types/bus';

const DEBOUNCE_MS = 300;

export function useSearchStops(query: string): {
  stops: BusStop[];
  loading: boolean;
  error: string | null;
} {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setStops([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;
    const timer = setTimeout(() => {
      searchBusStops(trimmed)
        .then((results) => {
          if (!cancelled) {
            setStops(results);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStops([]);
            setError(err?.message ?? 'Search failed');
            setLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { stops, loading, error };
}
