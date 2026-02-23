/**
 * Center dot indicator - shows when map center is far from user location.
 */
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function MapCenterDot() {
  return <View style={styles.dot} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
