import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CARD_PADDING } from '../constants/map';

type MapCloseButtonProps = {
  topInset: number;
  onPress: () => void;
};

export function MapCloseButton({ topInset, onPress }: MapCloseButtonProps) {
  return (
    <Pressable
      style={[styles.button, { top: topInset + 12 }]}
      onPress={onPress}
      hitSlop={12}
    >
      <Ionicons name="chevron-down" size={28} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: CARD_PADDING,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
