/**
 * Hook for user location heading overlay (chevron) on the map.
 * - Only shows when user is within the visible map region
 * - Updates position only when updatePosition() is called (e.g. on region change complete)
 * - Skips updates when point change is small to reduce flickering
 */
import { useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Region } from 'react-native-maps';

const ORBIT_RADIUS = 18;
const CHEVRON_SIZE = 20;
const MIN_POINT_DELTA = 10;

function isInVisibleRegion(
  lat: number,
  lng: number,
  region: Region
): boolean {
  const halfLat = (region.latitudeDelta ?? 0) / 2;
  const halfLng = (region.longitudeDelta ?? 0) / 2;
  return (
    lat >= region.latitude - halfLat &&
    lat <= region.latitude + halfLat &&
    lng >= region.longitude - halfLng &&
    lng <= region.longitude + halfLng
  );
}

export type UseUserLocationHeadingOverlayParams = {
  mapRef: React.RefObject<MapView | null>;
  location: { latitude: number; longitude: number } | null;
  heading: number | null;
  visibleRegion: Region | null;
  mapReady: boolean;
};

export function useUserLocationHeadingOverlay({
  mapRef,
  location,
  heading,
  visibleRegion,
  mapReady,
}: UseUserLocationHeadingOverlayParams) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const updatePosition = useCallback((regionOverride?: Region) => {
    const region = regionOverride ?? visibleRegion;
    if (!location || !mapRef.current || !mapReady || !region) return;
    if (!isInVisibleRegion(location.latitude, location.longitude, region)) {
      setPoint(null);
      lastPointRef.current = null;
      return;
    }
    mapRef.current
      .pointForCoordinate({ latitude: location.latitude, longitude: location.longitude })
      .then((p) => {
        if (p.x < 0 || p.y < 0) {
          setPoint(null);
          return;
        }
        const last = lastPointRef.current;
        const delta = last
          ? Math.hypot(p.x - last.x, p.y - last.y)
          : MIN_POINT_DELTA + 1;
        if (delta >= MIN_POINT_DELTA || !last) {
          lastPointRef.current = { x: p.x, y: p.y };
          setPoint({ x: p.x, y: p.y });
        }
      })
      .catch(() => {
        setPoint(null);
        lastPointRef.current = null;
      });
  }, [location?.latitude, location?.longitude, mapReady, visibleRegion, mapRef]);

  const h = heading ?? 0;
  const rad = (h * Math.PI) / 180;
  const cx = point ? point.x + ORBIT_RADIUS * Math.sin(rad) : 0;
  const cy = point ? point.y - ORBIT_RADIUS * Math.cos(rad) : 0;

  const overlay =
    location && point ? (
      <View
        style={[
          overlayStyles.chevron,
          {
            left: cx - CHEVRON_SIZE / 2,
            top: cy - CHEVRON_SIZE / 2,
            transform: [{ rotate: `${h - 90}deg` }],
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color="#fff" />
      </View>
    ) : null;

  return { overlay, updatePosition };
}

const overlayStyles = StyleSheet.create({
  chevron: {
    position: 'absolute',
    width: CHEVRON_SIZE,
    height: CHEVRON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
