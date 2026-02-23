/**
 * Map screen: bus stops on a map with Apple-style card layout.
 * Collapsed: square map at top. Tap to expand full screen.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, LayoutAnimation } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { useMapStops } from '../hooks/useMapStops';
import { useMapRegion } from '../hooks/useMapRegion';
import { MapCard } from '../components/MapCard';
import { BusStopMap, type BusStopMapRef } from '../components/BusStopMap';
import { MapCloseButton } from '../components/MapCloseButton';
import { MapRecenterButton } from '../components/MapRecenterButton';
import { BusStopModal } from '../components/BusStopModal';
import {
  FIXED_RADIUS_KM,
  CARD_PADDING,
  SINGAPORE_REGION,
  DEFAULT_REGION_DELTA,
} from '../constants/map';
import { colors } from '../theme/colors';
import type { BusStop } from '../types/bus';

type BusStopWithDistance = BusStop & { distanceKm?: number };

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const mapRef = useRef<BusStopMapRef>(null);
  const hasCentered = useRef(false);

  const { location } = useLocation();
  const [mapCenter, setMapCenter] = useState({
    lat: SINGAPORE_REGION.latitude,
    lng: SINGAPORE_REGION.longitude,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStop, setSelectedStop] = useState<BusStopWithDistance | null>(null);

  const { stops, loading } = useMapStops(mapCenter.lat, mapCenter.lng, FIXED_RADIUS_KM);

  const {
    visibleRegion,
    setVisibleRegion,
    showCenterDot,
    handleRegionChange,
    handleRegionChangeComplete,
    resetCenterDot,
    setLastCenter,
  } = useMapRegion({
    location,
    onMapCenterChange: (lat, lng) => setMapCenter({ lat, lng }),
  });

  const initialRegion = location
    ? { ...location, ...DEFAULT_REGION_DELTA }
    : { ...SINGAPORE_REGION, ...DEFAULT_REGION_DELTA };

  const centerOnUser = useCallback(() => {
    if (!location || !mapRef.current || hasCentered.current) return;
    hasCentered.current = true;
    const reg = { ...location, ...DEFAULT_REGION_DELTA };
    mapRef.current.animateToRegion(reg);
    setMapCenter({ lat: location.latitude, lng: location.longitude });
    setLastCenter(location.latitude, location.longitude);
    resetCenterDot();
  }, [location?.latitude, location?.longitude, setLastCenter, resetCenterDot]);

  const handleRecenter = useCallback(() => {
    if (!location || !mapRef.current) return;
    const delta =
      visibleRegion?.latitudeDelta != null && visibleRegion?.longitudeDelta != null
        ? { latitudeDelta: visibleRegion.latitudeDelta, longitudeDelta: visibleRegion.longitudeDelta }
        : DEFAULT_REGION_DELTA;
    const reg = { ...location, ...delta };
    mapRef.current.animateToRegion(reg);
    setMapCenter({ lat: location.latitude, lng: location.longitude });
    setLastCenter(location.latitude, location.longitude);
    resetCenterDot();
  }, [location?.latitude, location?.longitude, visibleRegion?.latitudeDelta, visibleRegion?.longitudeDelta, setLastCenter, resetCenterDot]);

  useEffect(() => {
    if (location) centerOnUser();
  }, [location?.latitude, location?.longitude, centerOnUser]);

  const handleMapReady = useCallback(() => {
    if (location) {
      const initialReg = { ...location, ...DEFAULT_REGION_DELTA };
      setVisibleRegion(initialReg);
      centerOnUser();
    }
  }, [location?.latitude, location?.longitude, centerOnUser, setVisibleRegion]);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const topInset = insets.top || 0;
  const collapsedCardWidth = screenWidth - CARD_PADDING * 2;
  const collapsedMapSize = Math.min(collapsedCardWidth, Math.floor(screenHeight * 0.45));

  return (
    <View style={styles.container}>
      <MapCard
        isExpanded={isExpanded}
        topInset={topInset}
        collapsedMapSize={collapsedMapSize}
        collapsedCardWidth={collapsedCardWidth}
        closeButton={
          <MapCloseButton topInset={topInset} onPress={toggleExpand} />
        }
        recenterButton={<MapRecenterButton onPress={handleRecenter} />}
      >
        <BusStopMap
          ref={mapRef}
          initialRegion={initialRegion}
          stops={stops}
          loading={loading}
          showCenterDot={showCenterDot}
          userLocation={location}
          isExpanded={isExpanded}
          onMapReady={handleMapReady}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onExpandPress={toggleExpand}
          onStopSelect={setSelectedStop}
        />
      </MapCard>

      <BusStopModal stop={selectedStop} onClose={() => setSelectedStop(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
