import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusStopCard } from './BusStopCard';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';
import type { BusStop } from '../types/bus';

export type BusStopWithDistance = BusStop & { distanceKm?: number };

type BusStopModalProps = {
  stop: BusStopWithDistance | null;
  onClose: () => void;
};

export function BusStopModal({ stop, onClose }: BusStopModalProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = (insets.bottom || 24) + 24;

  return (
    <Modal visible={!!stop} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { paddingBottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          {stop && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Bus stop</Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Text style={styles.close}>✕</Text>
                </Pressable>
              </View>
              <BusStopCard stop={stop} />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.title2,
    color: colors.text,
  },
  close: {
    fontSize: 24,
    color: colors.textMuted,
    padding: 4,
  },
});
