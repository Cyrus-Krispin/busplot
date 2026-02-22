/**
 * Main screen: full-screen map with bus stop markers.
 * Stops are loaded based on map center - pan/zoom to see different areas.
 * Tap a marker to view arrival times.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useMapStops } from '../hooks/useMapStops';
import { BusStopCard } from '../components/BusStopCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { distanceKm } from '../utils/distance';

/** Min center movement (km) before refetching - avoids crash when zooming (marker add/remove) */
const MIN_PAN_KM = 0.15;

const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/** Convert map region deltas to search radius in km. 1° ≈ 111 km. */
function regionToRadiusKm(region: Region): number {
  const degToKm = 111;
  const radius = Math.max(region.latitudeDelta, region.longitudeDelta) * degToKm * 0.6;
  return Math.max(0.5, Math.min(10, radius));
}

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const hasCentered = useRef(false);
  const { location } = useLocation();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; radiusKm: number }>({
    lat: SINGAPORE_REGION.latitude,
    lng: SINGAPORE_REGION.longitude,
    radiusKm: regionToRadiusKm(SINGAPORE_REGION),
  });
  const { stops } = useMapStops(mapCenter.lat, mapCenter.lng, mapCenter.radiusKm);
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

  useEffect(() => {
    if (location && !hasCentered.current && mapRef.current) {
      hasCentered.current = true;
      mapRef.current.animateToRegion(region, 500);
    }
  }, [location, region.latitude, region.longitude]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCenterRef = useRef({ lat: mapCenter.lat, lng: mapCenter.lng });

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    const lat = newRegion?.latitude;
    const lng = newRegion?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }
    const movedKm = distanceKm(lastCenterRef.current.lat, lastCenterRef.current.lng, lat, lng);
    if (movedKm < MIN_PAN_KM) {
      return;
    }
    lastCenterRef.current = { lat, lng };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setMapCenter({
        lat,
        lng,
        radiusKm: regionToRadiusKm(newRegion),
      });
    }, 300);
  }, []);

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
