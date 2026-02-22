/**
 * Main screen: full-screen map with bus stop markers.
 * Stops are loaded based on map center - pan/zoom to see different areas.
 * Tap a marker to view arrival times.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Modal, Pressable, ActivityIndicator, InteractionManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useMapStops } from '../hooks/useMapStops';
import { BusStopCard } from '../components/BusStopCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { distanceKm } from '../utils/distance';

/** Fixed search radius in km - does not change with zoom. */
const FIXED_RADIUS_KM = 0.8;
/** Min center movement (km) before refetching - avoids crash when zooming (marker add/remove) */
const MIN_PAN_KM = 0.15;
/** Throttle onRegionChange (ms) - reduces re-renders during pan/zoom */
const REGION_CHANGE_THROTTLE_MS = 150;
/** Min distance (km) from user location to show center dot */
const SHOW_CENTER_DOT_KM = 0.05;

const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const hasCentered = useRef(false);
  const { location } = useLocation();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: SINGAPORE_REGION.latitude,
    lng: SINGAPORE_REGION.longitude,
  });
  const { stops, loading } = useMapStops(mapCenter.lat, mapCenter.lng, FIXED_RADIUS_KM);
  const [selectedStop, setSelectedStop] = useState<{
    BusStopCode: string;
    Description: string;
    RoadName: string;
    Latitude: number;
    Longitude: number;
    distanceKm?: number;
  } | null>(null);

  const region = location
    ? {
        ...location,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      }
    : SINGAPORE_REGION;

  const centerOnUser = useCallback(() => {
    if (!location || !mapRef.current || hasCentered.current) return;
    hasCentered.current = true;
    const reg = {
      ...location,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    };
    mapRef.current.animateToRegion(reg, 500);
    setMapCenter({ lat: location.latitude, lng: location.longitude });
    lastCenterRef.current = { lat: location.latitude, lng: location.longitude };
    lastShowDotRef.current = false;
    setShowCenterDot(false);
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    if (location) centerOnUser();
  }, [location?.latitude, location?.longitude, centerOnUser]);

  const handleMapReady = useCallback(() => {
    if (location) centerOnUser();
  }, [location?.latitude, location?.longitude, centerOnUser]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCenterRef = useRef({ lat: mapCenter.lat, lng: mapCenter.lng });
  const [showCenterDot, setShowCenterDot] = useState(false);
  const lastShowDotRef = useRef(false);
  const lastRegionChangeTimeRef = useRef(0);
  const userHasPannedRef = useRef(false);
  const readyForUserPanRef = useRef(false);

  useEffect(() => {
    if (!location) return;
    const t = setTimeout(() => {
      readyForUserPanRef.current = true;
    }, 800);
    return () => clearTimeout(t);
  }, [location?.latitude, location?.longitude]);

  const handleRegionChange = useCallback(
    (region: Region) => {
      if (!location) return;
      const lat = region?.latitude;
      const lng = region?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }
      if (readyForUserPanRef.current) {
        const dist = distanceKm(lat, lng, location.latitude, location.longitude);
        if (dist > SHOW_CENTER_DOT_KM) {
          userHasPannedRef.current = true;
        }
      }
      if (!userHasPannedRef.current) return;
      const now = Date.now();
      if (now - lastRegionChangeTimeRef.current < REGION_CHANGE_THROTTLE_MS) {
        return;
      }
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
      const lat = newRegion?.latitude;
      const lng = newRegion?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }
      const movedKm = distanceKm(lastCenterRef.current.lat, lastCenterRef.current.lng, lat, lng);
      if (movedKm >= MIN_PAN_KM) {
        userHasPannedRef.current = true;
        if (location) {
          const dist = distanceKm(lat, lng, location.latitude, location.longitude);
          const wouldShow = dist > SHOW_CENTER_DOT_KM;
          if (wouldShow !== lastShowDotRef.current) {
            lastShowDotRef.current = wouldShow;
            setShowCenterDot(wouldShow);
          }
        }
        lastCenterRef.current = { lat, lng };
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          InteractionManager.runAfterInteractions(() => {
            setMapCenter({ lat, lng });
          });
        }, 500);
      } else if (location && userHasPannedRef.current) {
        const dist = distanceKm(lat, lng, location.latitude, location.longitude);
        const wouldShow = dist > SHOW_CENTER_DOT_KM;
        if (wouldShow !== lastShowDotRef.current) {
          lastShowDotRef.current = wouldShow;
          setShowCenterDot(wouldShow);
        }
      }
    },
    [location?.latitude, location?.longitude]
  );

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
        onMapReady={handleMapReady}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {stops.map((s) => (
          <Marker
            key={s.BusStopCode}
            coordinate={{ latitude: s.Latitude, longitude: s.Longitude }}
            title={s.Description}
            description={s.RoadName}
            pinColor={colors.accent}
            tracksViewChanges={false}
            onPress={() => {
              const dist = location
                ? distanceKm(location.latitude, location.longitude, s.Latitude, s.Longitude)
                : undefined;
              setSelectedStop({ ...s, distanceKm: dist });
            }}
          />
        ))}
      </MapView>

      {showCenterDot && <View style={styles.centerDot} pointerEvents="none" />}

      {loading && (
        <View style={[styles.loadingOverlay, { top: (insets.top || 0) + 16 }]} pointerEvents="none">
          <ActivityIndicator color={colors.accent} size="small" />
          <Text style={styles.loadingText}>Loading stops…</Text>
        </View>
      )}

      <Modal
        visible={!!selectedStop}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStop(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedStop(null)}>
          <Pressable
            style={[styles.modalContent, { paddingBottom: (insets.bottom || 24) + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedStop && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Bus stop</Text>
                  <Pressable onPress={() => setSelectedStop(null)} hitSlop={12}>
                    <Text style={styles.modalClose}>✕</Text>
                  </Pressable>
                </View>
                <BusStopCard stop={selectedStop} />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#737373' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loadingText: {
    ...typography.caption,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textMuted,
    padding: 4,
  },
});
