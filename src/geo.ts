/**
 * Capacitor-safe, high-accuracy geolocation helper.
 * Uses native @capacitor/geolocation on Android/iOS, falls back to navigator.geolocation on web.
 * Guarantees fresh satellite GPS fix with maximumAge: 0.
 */
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapGeo } from '@capacitor/geolocation';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Returns true if running inside a native Capacitor shell (Android/iOS).
 */
export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Request location permissions (only needed on native).
 */
/**
 * Request location permissions (only needed on native).
 * Android 12+ requires explicit fine location for high-accuracy GPS.
 */
async function ensurePermissions(): Promise<boolean> {
  if (!isNativePlatform()) return true;
  try {
    let status = await CapGeo.checkPermissions();
    if (status.location === 'granted') return true;
    
    // Explicitly request precise 'location' permission
    status = await CapGeo.requestPermissions({ permissions: ['location'] });
    return status.location === 'granted' || status.coarseLocation === 'granted';
  } catch (err) {
    console.warn('Geolocation permission request failed:', err);
    return false;
  }
}

/**
 * Get the user's current position (one-shot).
 * Forces maximumAge: 0 so Android does NOT return stale cell tower cache.
 */
export async function getCurrentPosition(
  timeout = 8000,
  enableHighAccuracy = true
): Promise<GeoPosition> {
  if (isNativePlatform()) {
    const ok = await ensurePermissions();
    if (!ok) throw new Error('Location permission denied');
    const pos = await CapGeo.getCurrentPosition({
      enableHighAccuracy,
      timeout,
      maximumAge: 0 // Never use stale cached location
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  }

  // Web fallback with high accuracy and zero maximum age
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      reject,
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

/**
 * High-accuracy GPS position getter.
 * Concurrently triggers one-shot and listens to satellite stream to get
 * the most precise coordinate (< 25m) as fast as possible.
 */
export async function getAccuratePosition(timeoutMs = 8000): Promise<GeoPosition> {
  const ok = await ensurePermissions();
  if (!ok) throw new Error('Location permission denied');

  return new Promise((resolve, reject) => {
    let bestPos: GeoPosition | null = null;
    let finished = false;

    const finish = (pos: GeoPosition) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try { cleanup(); } catch {}
      resolve(pos);
    };

    // 1. Immediately fire one-shot in parallel
    getCurrentPosition(4000, true)
      .then((oneShot) => {
        if (finished) return;
        if (!bestPos || oneShot.accuracy < bestPos.accuracy) {
          bestPos = oneShot;
        }
        // If accuracy is within 25 meters, satellite lock is already achieved!
        if (oneShot.accuracy <= 25) {
          finish(oneShot);
        }
      })
      .catch((err) => {
        console.warn('Initial one-shot attempt:', err);
      });

    // 2. Timeout fallback
    const timer = setTimeout(() => {
      if (finished) return;
      if (bestPos) {
        finish(bestPos);
      } else {
        // Fallback to one-shot if stream was quiet
        getCurrentPosition(4000, true).then(finish).catch(reject);
      }
    }, timeoutMs);

    // 3. Continuously watch for fine satellite fixes
    const cleanup = watchPosition(
      (pos) => {
        if (finished) return;
        if (!bestPos || pos.accuracy < bestPos.accuracy) {
          bestPos = pos;
        }
        // If accuracy is within 25 meters, we have an exact satellite lock!
        if (pos.accuracy <= 25) {
          finish(pos);
        }
      },
      (err) => {
        console.warn('Location stream warning:', err);
      }
    );
  });
}

/**
 * Start watching the user's position continuously. Returns a cleanup function.
 */
export function watchPosition(
  onUpdate: (pos: GeoPosition) => void,
  onError: (err: any) => void
): () => void {
  if (isNativePlatform()) {
    let watchId: string | null = null;
    CapGeo.watchPosition(
      { enableHighAccuracy: true },
      (pos, err) => {
        if (err) { onError(err); return; }
        if (pos) {
          onUpdate({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        }
      }
    ).then((id) => { watchId = id; });

    return () => {
      if (watchId !== null) {
        CapGeo.clearWatch({ id: watchId });
      }
    };
  }

  // Web fallback
  if (!navigator.geolocation) {
    onError(new Error('Geolocation not supported'));
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }),
    onError,
    { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}
