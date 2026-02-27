/**
 * Two-tier card for a bus stop in the nearby/search list.
 * Collapsed: up to 6 chips + a chevron-down button on the right to expand.
 * Expanded: all services sorted by service number, with 3 aligned arrival columns.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useArrivals } from '../hooks/useArrivals';
import { minsUntil, formatArrival } from '../utils/arrival';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { BusStop, BusServiceArrival, BusArrivalInfo } from '../types/bus';

type BusStopWithDistance = BusStop & { distanceKm?: number };

type ArrivalEntry = { key: string; serviceNo: string; mins: number };

const COLLAPSED_LIMIT = 6;

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

function sortServicesByNumber(services: BusServiceArrival[]): BusServiceArrival[] {
  return [...services].sort((a, b) => {
    const numA = parseInt(a.ServiceNo, 10);
    const numB = parseInt(b.ServiceNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.ServiceNo.localeCompare(b.ServiceNo);
  });
}

function ArrivalBadge({ info }: { info: BusArrivalInfo }) {
  const mins = minsUntil(info.EstimatedArrival);
  const color = mins !== null ? getArrivalColor(mins) : colors.textMuted;
  const loadColor = info.Load ? getLoadColor(info.Load) : colors.textMuted;
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeText, { color }]}>{formatArrival(mins)}</Text>
      {info.Load ? <View style={[styles.loadDot, { backgroundColor: loadColor }]} /> : null}
    </View>
  );
}

export function BusStopListCard({ stop }: { stop: BusStopWithDistance }) {
  const { arrivals, loading } = useArrivals(stop.BusStopCode);
  const [expanded, setExpanded] = useState(false);

  const collapsedEntries = flattenAndSort(arrivals).slice(0, COLLAPSED_LIMIT);
  const sortedServices = sortServicesByNumber(arrivals);
  const canExpand = arrivals.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.stopName} numberOfLines={2} ellipsizeMode="tail">
            {stop.Description}
          </Text>
          {stop.distanceKm != null && (
            <Text style={styles.distance}>{formatDistance(stop.distanceKm)}</Text>
          )}
        </View>
        {canExpand && (
          <TouchableOpacity
            style={styles.chevronButton}
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : expanded ? (
        <View style={styles.expandedBody}>
          {sortedServices.map((svc) => (
            <View key={svc.ServiceNo} style={styles.serviceRow}>
              <View style={styles.serviceNoWrap}>
                <Text style={styles.serviceNo}>{svc.ServiceNo}</Text>
              </View>
              <View style={styles.badgesRow}>
                <View style={styles.badgeWrap}><ArrivalBadge info={svc.NextBus} /></View>
                <View style={styles.badgeWrap}><ArrivalBadge info={svc.NextBus2} /></View>
                <View style={styles.badgeWrap}><ArrivalBadge info={svc.NextBus3} /></View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.chipsArea}>
          {collapsedEntries.map((entry) => (
            <View key={entry.key} style={styles.chip}>
              <Text style={styles.chipBusNo}>{entry.serviceNo}</Text>
              <Text style={[styles.chipArrival, { color: getArrivalColor(entry.mins) }]}>
                {formatArrival(entry.mins)}
              </Text>
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
    paddingLeft: 12,
    paddingRight: 4,
    paddingTop: 7,
    paddingBottom: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
    paddingRight: 4,
  },
  stopName: {
    ...typography.bodyMedium,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  distance: {
    ...typography.label,
    color: colors.accent,
    flexShrink: 0,
  },
  chevronButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  loaderRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  chipsArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    minWidth: 44,
  },
  chipBusNo: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  chipArrival: {
    fontSize: 10,
    fontWeight: '600',
  },
  expandedBody: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceNoWrap: {
    width: 44,
    alignItems: 'flex-start',
  },
  serviceNo: {
    ...typography.bodyMedium,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  badgesRow: {
    flex: 1,
    flexDirection: 'row',
  },
  badgeWrap: {
    flex: 1,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  loadDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
