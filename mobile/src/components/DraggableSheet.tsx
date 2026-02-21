/**
 * Draggable bottom sheet using Animated + PanResponder (no reanimated).
 */
import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

type Props = {
  snapPoints: number[]; // visible % from bottom, e.g. [18, 45, 90]
  initialIndex?: number;
  children: React.ReactNode;
  style?: object;
};

export function DraggableSheet({
  snapPoints,
  initialIndex = 0,
  children,
  style,
}: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const currentIndex = useRef(initialIndex);

  const getSnapY = useCallback(
    (index: number) => {
      const pct = snapPoints[Math.max(0, Math.min(index, snapPoints.length - 1))];
      // Positive = sheet moves down = less visible. 90% visible = 0, 18% visible = +72%
      return SCREEN_HEIGHT * (90 - pct) / 100;
    },
    [snapPoints]
  );

  const animateTo = useCallback(
    (index: number) => {
      const toValue = getSnapY(index);
      currentIndex.current = index;
      lastOffset.current = toValue;
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    },
    [translateY, getSnapY]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, g) => {
        const next = lastOffset.current + g.dy;
        const minY = getSnapY(snapPoints.length - 1);
        const maxY = getSnapY(0);
        translateY.setValue(Math.max(minY, Math.min(maxY, next)));
      },
      onPanResponderRelease: (_, g) => {
        const vy = g.vy;
        const currentY = lastOffset.current + g.dy;
        let nextIndex = currentIndex.current;

        if (vy < -0.5) {
          nextIndex = Math.min(currentIndex.current + 1, snapPoints.length - 1);
        } else if (vy > 0.5) {
          nextIndex = Math.max(currentIndex.current - 1, 0);
        } else {
          const snapYs = snapPoints.map((_, i) => getSnapY(i));
          let closest = 0;
          let minDist = Infinity;
          snapYs.forEach((y, i) => {
            const d = Math.abs(currentY - y);
            if (d < minDist) {
              minDist = d;
              closest = i;
            }
          });
          nextIndex = closest;
        }
        animateTo(nextIndex);
      },
    })
  ).current;

  useEffect(() => {
    lastOffset.current = getSnapY(initialIndex);
    translateY.setValue(getSnapY(initialIndex));
  }, []);

  return (
    <Animated.View
      style={[
        styles.sheet,
        style,
        {
          height: SHEET_HEIGHT,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.handleArea} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#404040',
  },
});
