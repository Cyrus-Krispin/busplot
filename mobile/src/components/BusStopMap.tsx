import { useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { MapCenterDot } from './MapCenterDot';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import { BusStopMarker } from './BusStopMarker';
import {
  DEFAULT_REGION_DELTA,
  darkMapStyle,
  mapType,
} from '../constants/map';
import type { BusStop } from '../types/bus';

export type BusStopWithDistance = BusStop & { distanceKm?: number };

export type BusStopMapRef = {
  animateToRegion: (region: Region) => void;
};

type BusStopMapProps = {
  initialRegion: Region;
  stops: BusStopWithDistance[];
  loading: boolean;
  showCenterDot: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  isExpanded: boolean;
  onMapReady: () => void;
  onRegionChange: (region: Region) => void;
  onRegionChangeComplete: (region: Region) => void;
  onExpandPress?: () => void;
  onStopSelect: (stop: BusStopWithDistance) => void;
};

export const BusStopMap = forwardRef<BusStopMapRef, BusStopMapProps>(
  (
    {
      initialRegion,
      stops,
      loading,
      showCenterDot,
      userLocation,
      isExpanded,
      onMapReady,
      onRegionChange,
      onRegionChangeComplete,
      onExpandPress,
      onStopSelect,
    },
    ref
  ) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region) => {
        mapRef.current?.animateToRegion(region, 500);
      },
    }));

    return (
      <>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          mapType={mapType}
          customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
          {...(Platform.OS === 'android' && { googleRenderer: 'LEGACY' as const })}
          onMapReady={onMapReady}
          onRegionChange={onRegionChange}
          onRegionChangeComplete={onRegionChangeComplete}
          onPress={!isExpanded ? onExpandPress : undefined}
        >
          {stops.map((s) => (
            <BusStopMarker
              key={s.BusStopCode}
              stop={s}
              userLocation={userLocation}
              onPress={onStopSelect}
            />
          ))}
        </MapView>

        {showCenterDot && <MapCenterDot />}
        {loading && <MapLoadingOverlay />}
      </>
    );
  }
);

BusStopMap.displayName = 'BusStopMap';
