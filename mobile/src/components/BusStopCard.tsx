/**
 * Card showing a bus stop and its arrival times.
 */
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useArrivals } from '../hooks/useArrivals';
import { minsUntil, formatArrival } from '../utils/arrival';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { BusStop } from '../types/bus';
import type { BusArrivalInfo } from '../types/bus';

type BusStopWithDistance = BusStop & { distanceKm?: number };

function getArrivalColor(mins: number): string {
  if (mins < 5) return colors.arrivalSoon;
  if (mins < 15) return colors.arrivalMedium;
  return colors.arrivalLater;
}

function getLoadColor(load: string): string {
  if (load === 'SEA') return colors.loadSeat;
  if (load === 'SDA') return colors.loadStand;
  return colors.loadLimited;
}

function ArrivalBadge({ info }: { info: BusArrivalInfo }) {
  const mins = minsUntil(info.EstimatedArrival);
  const color = mins !== null ? getArrivalColor(mins) : colors.textMuted;
  const loadColor = info.Load ? getLoadColor(info.Load) : colors.textMuted;
  return (
    <View style={styles.badge}>
      <Text style={[styles.arrivalText, { color }]}>{formatArrival(mins)}</Text>
      {info.Load ? <View style={[styles.loadDot, { backgroundColor: loadColor }]} /> : null}
    </View>
  );
}

export function BusStopCard({ stop }: { stop: BusStopWithDistance }) {
  const { arrivals, loading } = useArrivals(stop.BusStopCode);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.stopIdBadge}>
          <Text style={styles.stopId}>{stop.BusStopCode}</Text>
        </View>
        {stop.distanceKm != null ? (
          <Text style={styles.distance}>{stop.distanceKm.toFixed(1)} km</Text>
        ) : null}
      </View>
      <Text style={styles.description}>{stop.Description}</Text>
      <Text style={styles.road}>{stop.RoadName}</Text>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : (
        <View style={styles.services}>
          {arrivals.slice(0, 4).map((svc) => (
            <View key={svc.ServiceNo} style={styles.serviceRow}>
              <View style={styles.serviceNoWrap}>
                <Text style={styles.serviceNo}>{svc.ServiceNo}</Text>
              </View>
              <View style={styles.badges}>
                <ArrivalBadge info={svc.NextBus} />
                <ArrivalBadge info={svc.NextBus2} />
                <ArrivalBadge info={svc.NextBus3} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stopIdBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stopId: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  distance: {
    ...typography.caption,
    color: colors.textMuted,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 16,
    marginBottom: 2,
  },
  road: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  loaderWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  services: {
    gap: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  serviceNoWrap: {
    width: 40,
    alignItems: 'center',
  },
  serviceNo: {
    ...typography.bodyMedium,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 15,
  },
  badges: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  arrivalText: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  loadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
