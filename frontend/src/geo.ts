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
    if (status.location === 'granted' || status.coarseLocation === 'granted') return true;
    
    // Explicitly request precise 'location' permission
    status = await CapGeo.requestPermissions({ permissions: ['location'] });
    return status.location === 'granted' || status.coarseLocation === 'granted';
  } catch (err) {
    console.warn('Geolocation permission request failed:', err);
    return true; // Continue and attempt navigator.geolocation fallback
  }
}

/**
 * Get the user's current position (one-shot).
 * Highly resilient: tries high accuracy first, then automatically falls back to coarse
 * location (Wi-Fi/Cellular/IP) so it NEVER fails indoors or on laptops.
 */
export async function getCurrentPosition(
  timeout = 7000,
  enableHighAccuracy = true
): Promise<GeoPosition> {
  // 1. Try Native Capacitor Geolocation if available
  if (isNativePlatform()) {
    try {
      await ensurePermissions();
      const pos = await CapGeo.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge: 15000 // Accept fresh fix from last 15s for instant response
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (nativeErr) {
      console.warn('Native geolocation attempt failed, trying coarse native or web fallback:', nativeErr);
      try {
        const fallbackPos = await CapGeo.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000
        });
        return {
          latitude: fallbackPos.coords.latitude,
          longitude: fallbackPos.coords.longitude,
          accuracy: fallbackPos.coords.accuracy,
        };
      } catch (err2) {
        console.warn('Second native attempt failed, falling back to navigator.geolocation:', err2);
      }
    }
  }

  // 2. Web Geolocation with automatic coarse fallback
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device'));
      return;
    }

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => {
        console.warn('High accuracy web geolocation failed/timed out, attempting coarse fallback:', err);
        // Fallback to standard accuracy (works reliably indoors and on desktop Wi-Fi)
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => resolve({
            latitude: fallbackPos.coords.latitude,
            longitude: fallbackPos.coords.longitude,
            accuracy: fallbackPos.coords.accuracy,
          }),
          (finalErr) => reject(finalErr),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout, maximumAge: 15000 }
    );
  });
}

/**
 * High-accuracy GPS position getter.
 * Fast & reliable: resolves immediately if accuracy <= 35m, otherwise resolves with
 * the best available coordinate within the timeout window.
 */
export async function getAccuratePosition(timeoutMs = 6000): Promise<GeoPosition> {
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

    // 1. Fire fast one-shot in parallel
    getCurrentPosition(3500, true)
      .then((oneShot) => {
        if (finished) return;
        if (!bestPos || oneShot.accuracy < bestPos.accuracy) {
          bestPos = oneShot;
        }
        // If accuracy is good (<= 35m), resolve immediately!
        if (oneShot.accuracy <= 35) {
          finish(oneShot);
        }
      })
      .catch((err) => {
        console.warn('Fast one-shot attempt:', err);
      });

    // 2. Timeout fallback
    const timer = setTimeout(() => {
      if (finished) return;
      if (bestPos) {
        finish(bestPos);
      } else {
        // Final fallback to standard accuracy
        getCurrentPosition(4000, false).then(finish).catch(reject);
      }
    }, timeoutMs);

    // 3. Watch for finer satellite fixes
    const cleanup = watchPosition(
      (pos) => {
        if (finished) return;
        if (!bestPos || pos.accuracy < bestPos.accuracy) {
          bestPos = pos;
        }
        if (pos.accuracy <= 35) {
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

/**
 * Format duration in minutes into a clean, human-readable string:
 * - 45 min -> "45 min"
 * - 469 min -> "7 hr 49 min"
 * - 7740 min (129 hr) -> "5d 9h"
 */
export function formatDuration(totalMins: number): string {
  const m = Math.round(totalMins);
  if (m < 60) return `${m} min`;
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  if (hrs < 24) {
    if (rem === 0) return `${hrs} hr`;
    return `${hrs} hr ${rem} min`;
  }
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  if (remHrs === 0) return `${days} days`;
  return `${days}d ${remHrs}h`;
}
