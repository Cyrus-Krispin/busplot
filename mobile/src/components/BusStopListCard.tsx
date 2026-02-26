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

type ArrivalEntry = { key: string; serviceNo: string; mins: number };

function getArrivalColor(mins: number): string {
  if (mins < 5) return colors.arrivalSoon;
  if (mins < 15) return colors.arrivalMedium;
  return colors.arrivalLater;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function flattenAndSort(services: BusServiceArrival[]): ArrivalEntry[] {
  const entries: ArrivalEntry[] = [];
  for (const svc of services) {
    for (const [slot, bus] of [
      ['1', svc.NextBus],
      ['2', svc.NextBus2],
      ['3', svc.NextBus3],
    ] as const) {
      const mins = minsUntil(bus.EstimatedArrival);
      if (mins !== null) {
        entries.push({ key: `${svc.ServiceNo}-${slot}`, serviceNo: svc.ServiceNo, mins });
      }
    }
  }
  return entries.sort((a, b) => a.mins - b.mins);
}

export function BusStopListCard({ stop }: { stop: BusStopWithDistance }) {
  const { arrivals, loading } = useArrivals(stop.BusStopCode);
  const entries = flattenAndSort(arrivals);

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
          {entries.map((entry) => (
            <View key={entry.key} style={styles.chip}>
              <Text style={styles.busNo}>{entry.serviceNo}</Text>
              <Text style={[styles.arrivalTime, { color: getArrivalColor(entry.mins) }]}>
                {formatArrival(entry.mins)}
              </Text>
            </View>
          ))}
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
