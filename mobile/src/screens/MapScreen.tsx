/**
 * Main screen: full-screen map with draggable bottom sheet for nearby stops.
 */
import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useNearbyStops } from '../hooks/useNearbyStops';
import { useBackendCheck } from '../hooks/useBackendCheck';
import { DraggableSheet } from '../components/DraggableSheet';
import { BusStopCard } from '../components/BusStopCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const SNAP_POINTS = [18, 45, 90];

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const hasCentered = useRef(false);
  const { location, error, loading: locLoading } = useLocation();
  const { stops, loading: stopsLoading, isDemoMode, apiError } = useNearbyStops(location);
  const { connectionError } = useBackendCheck();

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

  const loading = locLoading || stopsLoading;

  const hasError = !!(error || apiError || (connectionError && stops.length === 0));

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
      >
        {stops.map((s) => (
          <Marker
            key={s.BusStopCode}
            coordinate={{ latitude: s.Latitude, longitude: s.Longitude }}
            title={s.Description}
            description={s.RoadName}
            pinColor={colors.accent}
          />
        ))}
      </MapView>

      <DraggableSheet
        snapPoints={SNAP_POINTS}
        initialIndex={0}
        style={styles.sheet}
      >
        <View style={styles.sheetContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby stops</Text>
          {!loading && stops.length > 0 && (
            <Text style={styles.count}>{stops.length} within 3 km</Text>
          )}
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>Demo</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.loadingText}>Finding nearby stops…</Text>
          </View>
        ) : stops.length === 0 ? (
          <View style={styles.emptyContainer}>
            {hasError ? (
              <>
                <Text style={styles.emptyTitle}>Cannot connect to backend</Text>
                <Text style={styles.errorMessage}>{connectionError || apiError || error}</Text>
                <Text style={styles.errorFix}>
                  • Backend running? (cd backend && ./mvnw spring-boot:run){'\n'}
                  • Same Wi‑Fi as computer?{'\n'}
                  • Correct IP in mobile/src/config.ts?
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No stops found</Text>
                <Text style={styles.emptySubtitle}>
                  Enable location or move closer to Singapore to see bus stops.
                </Text>
              </>
            )}
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {stops.map((stop) => (
              <BusStopCard key={stop.BusStopCode} stop={stop} />
            ))}
          </ScrollView>
        )}
        </View>
      </DraggableSheet>
      {hasError && (
        <View style={[styles.errorOverlay, { paddingTop: insets.top + 16 }]} pointerEvents="box-none">
          <Text style={styles.errorTitle}>⚠ Connection error</Text>
          <Text style={styles.errorMessage}>{connectionError || apiError || error}</Text>
        </View>
      )}
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
  sheetContent: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.text,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
  },
  demoBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#b91c1c',
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  errorFix: {
    fontSize: 14,
    color: '#fecaca',
    marginTop: 12,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 48,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
