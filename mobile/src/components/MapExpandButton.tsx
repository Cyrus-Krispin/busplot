import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CARD_PADDING } from '../constants/map';

type MapExpandButtonProps = {
  isExpanded: boolean;
  onPress: () => void;
};

export function MapExpandButton({ isExpanded, onPress }: MapExpandButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress} hitSlop={12}>
      <Ionicons
        name={isExpanded ? 'contract' : 'expand'}
        size={22}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: CARD_PADDING,
    right: CARD_PADDING,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
