/**
 * Navigation Engine Helpers: Distance, Bearing, Maneuver detection & step progression
 */

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export function formatDistance(meters: number): string {
  if (meters < 10) return 'NOW';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getManeuverType(modifier?: string, type?: string): 'left' | 'slight_left' | 'sharp_left' | 'right' | 'slight_right' | 'sharp_right' | 'straight' | 'uturn' | 'arrive' {
  const mod = (modifier || '').toLowerCase();
  const t = (type || '').toLowerCase();

  if (t.includes('arrive') || t.includes('destination')) return 'arrive';
  if (mod.includes('uturn')) return 'uturn';
  if (mod.includes('sharp left')) return 'sharp_left';
  if (mod.includes('slight left')) return 'slight_left';
  if (mod.includes('left')) return 'left';
  if (mod.includes('sharp right')) return 'sharp_right';
  if (mod.includes('slight right')) return 'slight_right';
  if (mod.includes('right')) return 'right';
  return 'straight';
}
