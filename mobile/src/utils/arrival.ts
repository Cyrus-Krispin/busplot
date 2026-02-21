/**
 * Arrival time helpers. LTA: round down to nearest minute.
 */
export function minsUntil(isoString: string): number | null {
  if (!isoString || !isoString.trim()) return null;
  const then = new Date(isoString).getTime();
  if (isNaN(then)) return null;
  return Math.max(0, Math.floor((then - Date.now()) / 60_000));
}

export function formatArrival(mins: number | null): string {
  if (mins === null) return '—';
  if (mins <= 0) return 'Arr';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
