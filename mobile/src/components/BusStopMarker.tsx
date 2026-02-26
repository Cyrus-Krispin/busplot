import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '../theme/colors';
import type { BusStop } from '../types/bus';

export type BusStopWithDistance = BusStop & { distanceKm?: number };

type BusStopMarkerProps = {
  stop: BusStopWithDistance;
  userLocation: { latitude: number; longitude: number } | null;
};

export function BusStopMarker({ stop }: BusStopMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude: stop.Latitude, longitude: stop.Longitude }}
      title={stop.Description}
      description={stop.RoadName}
      tracksViewChanges={false}
    >
      <View style={styles.pin} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 10,
    height: 10,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
  },
});