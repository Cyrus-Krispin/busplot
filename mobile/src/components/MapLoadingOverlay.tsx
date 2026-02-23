import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function MapLoadingOverlay() {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator color={colors.accent} size="small" />
      <Text style={styles.text}>Loading stops…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  text: {
    ...typography.caption,
    color: colors.text,
  },
});
