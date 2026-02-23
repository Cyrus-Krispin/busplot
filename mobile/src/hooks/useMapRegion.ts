/**
 * Map region state and center-dot visibility logic.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import type { Region } from 'react-native-maps';
import { InteractionManager } from 'react-native';
import { distanceKm } from '../utils/distance';

const MIN_PAN_KM = 0.15;
const REGION_CHANGE_THROTTLE_MS = 150;
const SHOW_CENTER_DOT_KM = 0.05;

export type UseMapRegionParams = {
  location: { latitude: number; longitude: number } | null;
  onMapCenterChange?: (lat: number, lng: number) => void;
};

export function useMapRegion({ location, onMapCenterChange }: UseMapRegionParams) {
  const [visibleRegion, setVisibleRegion] = useState<Region | null>(null);
  const [showCenterDot, setShowCenterDot] = useState(false);

  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastShowDotRef = useRef(false);
  const lastRegionChangeTimeRef = useRef(0);
  const userHasPannedRef = useRef(false);
  const readyForUserPanRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!location) return;
    const t = setTimeout(() => {
      readyForUserPanRef.current = true;
    }, 800);
    return () => clearTimeout(t);
  }, [location?.latitude, location?.longitude]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const handleRegionChange = useCallback(
    (region: Region) => {
      const now = Date.now();
      setVisibleRegion(region);
      if (!location) return;

      const lat = region?.latitude;
      const lng = region?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      if (readyForUserPanRef.current) {
        const dist = distanceKm(lat, lng, location.latitude, location.longitude);
        if (dist > SHOW_CENTER_DOT_KM) userHasPannedRef.current = true;
      }

      if (!userHasPannedRef.current) return;

      if (now - lastRegionChangeTimeRef.current < REGION_CHANGE_THROTTLE_MS) return;
      lastRegionChangeTimeRef.current = now;

      const dist = distanceKm(lat, lng, location.latitude, location.longitude);
      const wouldShow = dist > SHOW_CENTER_DOT_KM;
      if (wouldShow !== lastShowDotRef.current) {
        lastShowDotRef.current = wouldShow;
        setShowCenterDot(wouldShow);
      }
    },
    [location?.latitude, location?.longitude]
  );

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setVisibleRegion(newRegion);
      if (!location) return;

      const lat = newRegion?.latitude;
      const lng = newRegion?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const lastCenter = lastCenterRef.current;
      const movedKm = lastCenter
        ? distanceKm(lastCenter.lat, lastCenter.lng, lat, lng)
        : MIN_PAN_KM + 1;

      if (movedKm >= MIN_PAN_KM) {
        userHasPannedRef.current = true;
        const dist = distanceKm(lat, lng, location.latitude, location.longitude);
        const wouldShow = dist > SHOW_CENTER_DOT_KM;
        if (wouldShow !== lastShowDotRef.current) {
          lastShowDotRef.current = wouldShow;
          setShowCenterDot(wouldShow);
        }
        lastCenterRef.current = { lat, lng };
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          InteractionManager.runAfterInteractions(() => {
            onMapCenterChange?.(lat, lng);
          });
        }, 500);
      } else if (userHasPannedRef.current) {
        const dist = distanceKm(lat, lng, location.latitude, location.longitude);
        const wouldShow = dist > SHOW_CENTER_DOT_KM;
        if (wouldShow !== lastShowDotRef.current) {
          lastShowDotRef.current = wouldShow;
          setShowCenterDot(wouldShow);
        }
      }
    },
    [location?.latitude, location?.longitude, onMapCenterChange]
  );

  const resetCenterDot = useCallback(() => {
    lastShowDotRef.current = false;
    setShowCenterDot(false);
  }, []);

  const setLastCenter = useCallback((lat: number, lng: number) => {
    lastCenterRef.current = { lat, lng };
  }, []);

  return {
    visibleRegion,
    setVisibleRegion,
    showCenterDot,
    handleRegionChange,
    handleRegionChangeComplete,
    resetCenterDot,
    setLastCenter,
  };
}
