/**
 * Two-tier card for a bus stop in the nearby list.
 * Top: stop name + distance. Bottom: bus chips sorted by soonest arrival.
 */
import { View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useArrivals } from '../hooks/useArrivals';
import { minsUntil, formatArrival } from '../utils/arrival';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { BusStop, BusServiceArrival } from '../types/bus';

type BusStopWithDistance = BusStop & { distanceKm?: number };

function getArrivalColor(mins: number | null): string {
  if (mins === null) return colors.textMuted;
  if (mins < 5) return colors.arrivalSoon;
  if (mins < 15) return colors.arrivalMedium;
  return colors.arrivalLater;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function sortByEarliestArrival(services: BusServiceArrival[]): BusServiceArrival[] {
  return [...services].sort((a, b) => {
    const mA = minsUntil(a.NextBus.EstimatedArrival) ?? Infinity;
    const mB = minsUntil(b.NextBus.EstimatedArrival) ?? Infinity;
    return mA - mB;
  });
}

export function BusStopListCard({ stop }: { stop: BusStopWithDistance }) {
  const { arrivals, loading } = useArrivals(stop.BusStopCode);
  const sorted = sortByEarliestArrival(arrivals);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.stopName} numberOfLines={2} ellipsizeMode="tail">
          {stop.Description}
        </Text>
        {stop.distanceKm != null && (
          <Text style={styles.distance}>{formatDistance(stop.distanceKm)}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.services}
        >
          {sorted.map((svc) => {
            const mins = minsUntil(svc.NextBus.EstimatedArrival);
            const timeColor = getArrivalColor(mins);
            return (
              <View key={svc.ServiceNo} style={styles.chip}>
                <Text style={styles.busNo}>{svc.ServiceNo}</Text>
                <Text style={[styles.arrivalTime, { color: timeColor }]}>
                  {formatArrival(mins)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 4,
    gap: 8,
  },
  stopName: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  distance: {
    ...typography.label,
    color: colors.accent,
    flexShrink: 0,
    marginTop: 1,
  },
  loaderRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  services: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    minWidth: 44,
  },
  busNo: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  arrivalTime: {
    fontSize: 10,
    fontWeight: '600',
  },
});
