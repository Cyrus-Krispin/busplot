/**
 * Search for bus stops by code or name.
 */
import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { BusStopListCard } from '../components/BusStopListCard';
import { useSearchStops } from '../hooks/useSearchStops';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { BusStop } from '../types/bus';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const { stops, loading, error } = useSearchStops(query);

  const trimmed = query.trim();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar value={query} onChangeText={setQuery} autoFocus={false} />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      )}

      {!loading && !error && trimmed && stops.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="bus-outline" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No stops found</Text>
          <Text style={styles.emptyText}>Try a different name, code, or road</Text>
        </View>
      )}

      {!loading && !error && !trimmed && (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Find a bus stop</Text>
          <Text style={styles.emptyText}>Search by stop name, code, or road</Text>
        </View>
      )}

      {!loading && !error && stops.length > 0 && (
        <FlatList
          data={stops}
          keyExtractor={(item: BusStop) => item.BusStopCode}
          renderItem={({ item }) => <BusStopListCard stop={item} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    ...typography.title2,
    color: colors.text,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
