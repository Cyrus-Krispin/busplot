/**
 * Scrollable list of nearby bus stops, ordered nearest first.
 */
import { FlatList, StyleSheet } from 'react-native';
import { BusStopListCard } from './BusStopListCard';
import type { BusStop } from '../types/bus';

type BusStopWithDistance = BusStop & { distanceKm?: number };

type BusStopListProps = {
  stops: BusStopWithDistance[];
};

export function BusStopList({ stops }: BusStopListProps) {
  const sorted = [...stops].sort(
    (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(s) => s.BusStopCode}
      renderItem={({ item }) => <BusStopListCard stop={item} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 20,
  },
});
