/**
 * Dark theme for Busplot.
 * Black primary, white for values, colors for metrics.
 */
export const colors = {
  primary: '#000000',
  background: '#0c0c0c',
  surface: '#161616',
  surfaceElevated: '#1f1f1f',
  surfaceHover: '#252525',

  text: '#fafafa',
  textSecondary: '#a3a3a3',
  textMuted: '#666666',

  // Metric colors
  arrivalSoon: '#22c55e',    // green - < 5 min
  arrivalMedium: '#eab308',  // amber - 5–15 min
  arrivalLater: '#f97316',   // orange - 15+ min

  loadSeat: '#22c55e',       // SEA - seats available
  loadStand: '#eab308',      // SDA - standing
  loadLimited: '#ef4444',    // LSD - limited

  accent: '#2563eb',
  accentMuted: '#1d4ed8',
  border: '#262626',
  error: '#ef4444',
  success: '#22c55e',
} as const;
