import { Platform } from 'react-native';

export const FIXED_RADIUS_KM = 0.8;

/** Cap markers to avoid react-native-maps native crash when updating many during pan */
export const MAX_MAP_MARKERS = 15;
export const CARD_RADIUS = 12;
export const CARD_PADDING = 16;

export const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const DEFAULT_REGION_DELTA = {
  latitudeDelta: 0.010,
  longitudeDelta: 0.010,
} as const;

export const darkMapStyle = [
  { elementType: 'geometry' as const, stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill' as const, stylers: [{ color: '#737373' }] },
  { elementType: 'labels.text.stroke' as const, stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road' as const, elementType: 'geometry' as const, stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'water' as const, elementType: 'geometry' as const, stylers: [{ color: '#0d0d0d' }] },
];

export const mapType = Platform.OS === 'ios' ? 'mutedStandard' : 'standard';
