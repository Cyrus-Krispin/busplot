import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '../theme/colors';
import { distanceKm } from '../utils/distance';
import type { BusStop } from '../types/bus';

export type BusStopWithDistance = BusStop & { distanceKm?: number };

type BusStopMarkerProps = {
  stop: BusStopWithDistance;
  userLocation: { latitude: number; longitude: number } | null;
  onPress: (stop: BusStopWithDistance) => void;
};

export function BusStopMarker({ stop, userLocation, onPress }: BusStopMarkerProps) {
  const distance = userLocation
    ? distanceKm(userLocation.latitude, userLocation.longitude, stop.Latitude, stop.Longitude)
    : undefined;

  const handlePress = () => {
    onPress({ ...stop, distanceKm: distance });
  };

  return (
    <Marker
      coordinate={{ latitude: stop.Latitude, longitude: stop.Longitude }}
      title={stop.Description}
      description={stop.RoadName}
      tracksViewChanges={false}
      onPress={handlePress}
    >
      <View style={styles.pin} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#fff',
  },
});