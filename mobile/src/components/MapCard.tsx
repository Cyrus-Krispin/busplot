import { View, StyleSheet, Platform } from 'react-native';
import { CARD_RADIUS, CARD_PADDING } from '../constants/map';
import { colors } from '../theme/colors';

type MapCardProps = {
  isExpanded: boolean;
  topInset: number;
  bottomInset: number;
  collapsedMapSize: number;
  collapsedCardWidth: number;
  children: React.ReactNode;
  expandButton?: React.ReactNode;
  recenterButton?: React.ReactNode;
};

export function MapCard({
  isExpanded,
  topInset,
  bottomInset,
  collapsedMapSize,
  collapsedCardWidth,
  children,
  expandButton,
  recenterButton,
}: MapCardProps) {
  const cardStyle = isExpanded
    ? [
        styles.card,
        styles.expanded,
        {
          marginTop: topInset + CARD_PADDING,
          marginHorizontal: CARD_PADDING,
          marginBottom: bottomInset + CARD_PADDING,
        },
      ]
    : [
        styles.card,
        styles.collapsed,
        {
          marginTop: topInset + 12,
          marginHorizontal: CARD_PADDING,
          width: collapsedCardWidth,
          height: collapsedMapSize,
        },
      ];

  const mapWrapperStyle = !isExpanded
    ? [styles.mapWrapper, { width: collapsedMapSize, height: collapsedMapSize, alignSelf: 'center' as const }]
    : styles.mapWrapper;

  return (
    <View style={cardStyle}>
      <View style={mapWrapperStyle}>{children}</View>
      {expandButton}
      {recenterButton}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  collapsed: {},
  expanded: { flex: 1 },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
});
