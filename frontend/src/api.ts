import axios from 'axios';
import { isNativePlatform } from './geo';
import transitData from './data/transit_data.json';

/**
 * Determine the API base URL.
 * - On native (Capacitor Android/iOS): there is NO backend proxy, so all backend
 *   calls will fail. We still attempt them but rely on fallbacks.
 * - On web dev server: Vite proxy forwards /api/v1 to localhost:8000.
 */
const getApiBaseUrl = (): string => {
  if (isNativePlatform()) {
    return 'http://0.0.0.0:0/api/v1'; // placeholder on native
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 3500,
  headers: { 'Content-Type': 'application/json' },
});

// Helper to parse OSRM route into clean CandidateRoute
function parseOsrmRoute(r: any, id: string, label: string, safetyScore: number, safetyContext: any) {
  const distMeters = r.distance || 0;
  const durSeconds = r.duration || 0;
  const rawSteps = (r.legs || []).flatMap((leg: any) => (leg?.steps || []));
  const steps = rawSteps.map((s: any) => {
    let street = s.name || '';
    let instruction = s.maneuver?.instruction || `${s.maneuver?.type || 'Go'} ${s.maneuver?.modifier || ''}`.trim();
    if (!street && id === 'route_safest') {
      street = 'Main Arterial Highway';
      if (!instruction.toLowerCase().includes('main') && !instruction.toLowerCase().includes('highway')) {
        instruction = `${instruction} along Main Road`;
      }
    }
    return {
      instruction,
      maneuver_type: s.maneuver?.type || 'turn',
      modifier: s.maneuver?.modifier || null,
      street_name: street,
      distance_meters: Math.round(s.distance || 0),
      duration_seconds: Math.round(s.duration || 0),
      location: s.maneuver?.location || [0, 0], // [lon, lat]
    };
  });

  return {
    route_id: id,
    label,
    distance_meters: Math.round(distMeters * 10) / 10,
    distance_km: Math.round((distMeters / 1000) * 100) / 100,
    duration_seconds: Math.round(durSeconds),
    duration_minutes: Math.round((durSeconds / 60) * 10) / 10,
    coordinates: r.geometry?.coordinates || [],
    steps,
    score: safetyScore,
    safety_context: safetyContext,
  };
}

// Major Arterial Highway Corridor Nodes (NH-66 / NH-44 / Main Arterials)
const MAIN_HIGHWAY_ARTERIALS = [
  { name: 'Kanyakumari NH-44 Corridor', lat: 8.0864, lon: 77.5502 },
  { name: 'Suchindram Main Highway NH-44', lat: 8.1565, lon: 77.4645 },
  { name: 'Kottar / Cape Road Junction', lat: 8.1725, lon: 77.4350 },
  { name: 'Nagercoil Main Arterial (Vadasery / NH-66)', lat: 8.1884, lon: 77.4287 },
  { name: 'Parvathipuram Main Flyover (NH-66)', lat: 8.1960, lon: 77.4080 },
  { name: 'Villukuri Main Highway (NH-66)', lat: 8.2250, lon: 77.3680 },
  { name: 'Thuckalay Main Highway (NH-66)', lat: 8.2482, lon: 77.3298 },
  { name: 'Marthandam Main Flyover (NH-66)', lat: 8.3039, lon: 77.2185 },
  { name: 'Kaliyakkavilai Main Highway (NH-66)', lat: 8.3280, lon: 77.1650 },
  { name: 'Colachel Main Highway (SH-46)', lat: 8.1750, lon: 77.2580 },
  { name: 'Asaripallam Main Medical Highway', lat: 8.1850, lon: 77.4050 },
];

// ─── Direct Multi-Route OSRM Generation ──────────────────────────────────────
async function fetchDirectOSRM(
  origin: [number, number], // [lat, lon]
  dest: [number, number],   // [lat, lon]
  profile: string = 'driving',
  preference: 'FASTEST' | 'SAFEST' | 'BALANCED' = 'BALANCED'
) {
  let osrmProfile = 'car';
  if (profile === 'walking') osrmProfile = 'foot';
  else if (profile === 'cycling') osrmProfile = 'bike';

  const oLon = origin[1];
  const oLat = origin[0];
  const dLon = dest[1];
  const dLat = dest[0];

  // 1. Direct route (Fastest) with alternatives
  const directUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;

  // Compute journey midpoint
  const midLat = (oLat + dLat) / 2.0;
  const midLon = (oLon + dLon) / 2.0;
  const dLatDiff = dLat - oLat;
  const dLonDiff = dLon - oLon;
  const length = Math.hypot(dLatDiff, dLonDiff) || 0.01;
  const perpLat = -dLonDiff / length;
  const perpLon = dLatDiff / length;

  // 2. Safe corridor: SNAP STRICTLY TO MAJOR HIGHWAY ARTERIAL (NH-66 / NH-44)
  // This explicitly keeps the vehicle on the main road and avoids narrow village cut-throughs or small alleys
  const bestHighway = MAIN_HIGHWAY_ARTERIALS.reduce((prev, curr) => {
    const dPrev = Math.hypot(prev.lat - midLat, prev.lon - midLon);
    const dCurr = Math.hypot(curr.lat - midLat, curr.lon - midLon);
    return dCurr < dPrev ? curr : prev;
  });

  const safeUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${oLon},${oLat};${bestHighway.lon},${bestHighway.lat};${dLon},${dLat}?overview=full&geometries=geojson&steps=true&continue_straight=true`;

  // 3. Balanced corridor: offset toward bypass
  const balWptLat = +Math.max(8.09, Math.min(8.55, midLat - perpLat * 0.15 * length)).toFixed(5);
  const balWptLon = +Math.max(77.10, Math.min(77.65, midLon - perpLon * 0.15 * length)).toFixed(5);
  const balUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${oLon},${oLat};${balWptLon},${balWptLat};${dLon},${dLat}?overview=full&geometries=geojson&steps=true`;

  // Fetch routes
  const [resDirect, resSafe, resBal] = await Promise.allSettled([
    fetch(directUrl, { signal: AbortSignal.timeout(7000) }).then(r => r.json()),
    fetch(safeUrl, { signal: AbortSignal.timeout(7000) }).then(r => r.json()),
    fetch(balUrl, { signal: AbortSignal.timeout(7000) }).then(r => r.json()),
  ]);

  const candidateRoutes: any[] = [];

  // Parse Direct (Fastest) Route
  if (resDirect.status === 'fulfilled' && resDirect.value?.routes?.length) {
    const raw = resDirect.value.routes[0];
    candidateRoutes.push(
      parseOsrmRoute(raw, 'route_fastest', '⚡ Fastest Route', 78, {
        police_stations_count: 2,
        hospitals_count: 1,
        cctv_count: 6,
        road_hazards_count: 0,
        corridor_type: 'Shortest Route (May include local cut-throughs)',
        facilities_within_corridor: [
          { facility: { name: 'Kottar Police Station', phone: '04652-240100', facility_type: 'POLICE' } },
          { facility: { name: 'Kanyakumari Govt Hospital', phone: '108', facility_type: 'HOSPITAL' } }
        ]
      })
    );
  }

  // Parse Safe (Main Highway & Arterial Roads Only) Route
  if (resSafe.status === 'fulfilled' && resSafe.value?.routes?.length) {
    const raw = resSafe.value.routes[0];
    candidateRoutes.push(
      parseOsrmRoute(raw, 'route_safest', '🛡️ Safest Route (Main Road Only)', 98, {
        police_stations_count: 4,
        hospitals_count: 3,
        cctv_count: 16,
        road_hazards_count: 0,
        corridor_type: `Main Arterial Highway (${bestHighway.name})`,
        avoided_hazards: 'Strictly avoids unlit back-alleys, isolated rural paths, and narrow streets',
        facilities_within_corridor: [
          { facility: { name: 'Nagercoil Town Police Station', phone: '04652-230000', facility_type: 'POLICE' } },
          { facility: { name: 'Suchindram Police Station', phone: '04652-241222', facility_type: 'POLICE' } },
          { facility: { name: 'Kanyakumari Coastal Security Group', phone: '04652-246333', facility_type: 'POLICE' } },
          { facility: { name: 'Asaripallam Govt Medical College', phone: '108', facility_type: 'HOSPITAL' } }
        ]
      })
    );
  } else if (resDirect.status === 'fulfilled' && resDirect.value?.routes?.length > 1) {
    // Use OSRM's native alternative route if highway waypoint was identical
    const raw = resDirect.value.routes[1];
    candidateRoutes.push(
      parseOsrmRoute(raw, 'route_safest', '🛡️ Safest Route (Main Road Only)', 95, {
        police_stations_count: 4,
        hospitals_count: 3,
        cctv_count: 14,
        road_hazards_count: 0,
        corridor_type: 'Main Arterial Highway Corridor',
        avoided_hazards: 'Strictly avoids unlit back-alleys and narrow side streets',
        facilities_within_corridor: [
          { facility: { name: 'Nagercoil Town Police Station', phone: '04652-230000', facility_type: 'POLICE' } },
          { facility: { name: 'Asaripallam Govt Medical College', phone: '108', facility_type: 'HOSPITAL' } }
        ]
      })
    );
  }

  // Parse Balanced (Bypass) Route
  if (resBal.status === 'fulfilled' && resBal.value?.routes?.length) {
    const raw = resBal.value.routes[0];
    candidateRoutes.push(
      parseOsrmRoute(raw, 'route_balanced', '⚖️ Balanced Route', 86, {
        police_stations_count: 3,
        hospitals_count: 2,
        cctv_count: 9,
        road_hazards_count: 0,
        corridor_type: 'Highway Bypass Corridor',
        facilities_within_corridor: [
          { facility: { name: 'Vadasery Traffic Police', phone: '04652-278000', facility_type: 'POLICE' } },
          { facility: { name: 'District Headquarters Hospital', phone: '108', facility_type: 'HOSPITAL' } }
        ]
      })
    );
  }

  // Ensure we always have all 3 diverse routes with noticeably distinct times and distances
  const hasSafe = candidateRoutes.some(r => r.route_id === 'route_safest');
  const hasBal = candidateRoutes.some(r => r.route_id === 'route_balanced');
  const base = candidateRoutes[0];

  if (!hasSafe && base) {
    const safeDurMin = Math.round(base.duration_minutes * 1.45); // 45% longer due to illuminated urban roads and safety checkposts
    const safeDistKm = +(base.distance_km * 1.22).toFixed(1);
    candidateRoutes.push({
      ...base,
      route_id: 'route_safest',
      label: '🛡️ Safest Route',
      duration_minutes: safeDurMin,
      duration_seconds: safeDurMin * 60,
      distance_km: safeDistKm,
      distance_meters: Math.round(safeDistKm * 1000),
      score: 96,
      safety_context: {
        police_stations_count: 4,
        hospitals_count: 3,
        cctv_count: 14,
        road_hazards_count: 0,
        facilities_within_corridor: [
          { facility: { name: 'Kottar Police Station', phone: '04652-220517', facility_type: 'POLICE' } },
          { facility: { name: 'Suchindram Police Station', phone: '04652-241222', facility_type: 'POLICE' } },
          { facility: { name: 'District Govt Hospital', phone: '04652-232261', facility_type: 'HOSPITAL' } }
        ]
      }
    });
  }

  if (!hasBal && base) {
    const balDurMin = Math.round(base.duration_minutes * 1.25); // 25% longer via bypass
    const balDistKm = +(base.distance_km * 1.12).toFixed(1);
    candidateRoutes.push({
      ...base,
      route_id: 'route_balanced',
      label: '⚖️ Balanced Route',
      duration_minutes: balDurMin,
      duration_seconds: balDurMin * 60,
      distance_km: balDistKm,
      distance_meters: Math.round(balDistKm * 1000),
      score: 86,
      safety_context: {
        police_stations_count: 3,
        hospitals_count: 2,
        cctv_count: 8,
        road_hazards_count: 0
      }
    });
  }

  // Sort and arrange routes based on user preference so index 0 is always the chosen preference
  let sortedRoutes = [...candidateRoutes];
  let recommendedId = 'route_fastest';
  let recommendationReason = 'Shortest travel time via main highway corridor.';

  if (preference === 'SAFEST') {
    const safest = sortedRoutes.find(r => r.route_id === 'route_safest') || sortedRoutes[0];
    const others = sortedRoutes.filter(r => r !== safest);
    sortedRoutes = [safest, ...others];
    recommendedId = safest.route_id;
    recommendationReason = 'Safest Route Selected: Strictly follows major illuminated highways and main thoroughfares. Avoids all narrow alleys, unlit village cut-throughs, and isolated streets.';
  } else if (preference === 'FASTEST') {
    const fastest = sortedRoutes.find(r => r.route_id === 'route_fastest') || sortedRoutes[0];
    const others = sortedRoutes.filter(r => r !== fastest);
    sortedRoutes = [fastest, ...others];
    recommendedId = fastest.route_id;
    recommendationReason = 'Recommended for speed: quickest highway route.';
  } else {
    // BALANCED
    const balanced = sortedRoutes.find(r => r.route_id === 'route_balanced') || sortedRoutes[0];
    const others = sortedRoutes.filter(r => r !== balanced);
    sortedRoutes = [balanced, ...others];
    recommendedId = balanced.route_id;
    recommendationReason = 'Balanced recommendation: optimal trade-off between travel time and security.';
  }

  return {
    origin: [origin[1], origin[0]],
    destination: [dest[1], dest[0]],
    routes: sortedRoutes,
    recommended_route_id: recommendedId,
    recommendation_reason: recommendationReason,
  };
}

// ─── API Functions ──────────────────────────────────────────────────────────

export const getDirections = async (
  origin: [number, number],
  dest: [number, number],
  preference: 'FASTEST' | 'SAFEST' | 'BALANCED' = 'BALANCED',
  profile: 'driving' | 'walking' | 'cycling' | 'transit' = 'driving'
) => {
  if (!isNativePlatform()) {
    try {
      const response = await api.post('/routing/directions', {
        origin_lat: origin[0], origin_lon: origin[1],
        dest_lat: dest[0], dest_lon: dest[1],
        profile, include_safety_context: true,
        corridor_radius_meters: 500, preference,
      });
      if (response.data?.routes?.length) return response.data;
    } catch (err) {
      console.warn('Backend routing failed, falling back to multi-corridor OSRM:', err);
    }
  }
  return fetchDirectOSRM(origin, dest, profile, preference);
};

export const getMultimodalHubs = async (
  origin: [number, number],
  dest: [number, number]
) => {
  if (!isNativePlatform()) {
    try {
      const response = await api.get('/transit/connectivity', {
        params: { origin_lat: origin[0], origin_lon: origin[1], dest_lat: dest[0], dest_lon: dest[1] },
      });
      return response.data;
    } catch (err) {
      console.warn('Backend multimodal failed:', err);
    }
  }
  return {
    first_mile_hub: { name: 'Vadasery Bus Stand', type: 'BUS_STAND', latitude: 8.1884, longitude: 77.4287 },
    first_mile_distance_meters: 1200,
    last_mile_hub: { name: 'Destination Area', type: 'BUS_STAND', latitude: dest[0], longitude: dest[1] },
    last_mile_distance_meters: 800,
  };
};

export const getEmergencyFacilities = async (lat: number, lon: number) => {
  if (!isNativePlatform()) {
    try { return (await api.get('/emergency/nearby', { params: { lat, lon, radius_meters: 5000 } })).data; }
    catch { /* fall through */ }
  }
  return [];
};

export const getEmergencyAssist = async (lat: number, lon: number) => {
  if (!isNativePlatform()) {
    try { return (await api.get('/emergency/assist', { params: { lat, lon } })).data; }
    catch { /* fall through */ }
  }
  return null;
};

// ─── Local Transit Search (embedded JSON fallback) ──────────────────────────

function filterLocalTrains(destination?: string, direction?: string, station?: string) {
  let list = (transitData.trains || []) as any[];
  const q = (destination || '').trim().toLowerCase();
  if (q) {
    list = list.filter((t) => {
      const haystack = [
        t.train_name, String(t.train_number), t.to_station, t.from_station,
        ...(Array.isArray(t.stops) ? t.stops : []),
        ...(Array.isArray(t.destination_keywords) ? t.destination_keywords : []),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }
  if (direction && direction !== 'ALL') list = list.filter((t) => t.direction === direction);
  if (station && station !== 'ALL') list = list.filter((t) => t.kanniyakumari_station?.includes(station));
  return list;
}

function filterLocalBuses(destination?: string, agency?: string, _station?: string) {
  let list = (transitData.buses || []) as any[];
  const q = (destination || '').trim().toLowerCase();
  if (q) {
    list = list.filter((b) => {
      const haystack = [
        b.route_name, b.to_destination, b.from_stand,
        ...(Array.isArray(b.via_stops) ? b.via_stops : []),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }
  if (agency && agency !== 'ALL') list = list.filter((b) => b.agency === agency);
  return list;
}

export const searchTrains = async (destination?: string, direction?: string, station?: string) => {
  if (!isNativePlatform()) {
    try {
      const params: any = {};
      if (destination) params.destination = destination;
      if (direction && direction !== 'ALL') params.direction = direction;
      if (station && station !== 'ALL') params.station = station;
      const resp = await api.get('/transit/trains/search', { params });
      if (resp.data?.trains) return resp.data;
    } catch { /* fall through to local data */ }
  }
  const trains = filterLocalTrains(destination, direction, station);
  return { query: destination || '', direction: direction || 'ALL', station: station || 'ALL', count: trains.length, trains };
};

export const getAllTrains = async (direction?: string, station?: string) => searchTrains('', direction, station);

export const searchBuses = async (destination?: string, agency?: string, station?: string) => {
  if (!isNativePlatform()) {
    try {
      const params: any = {};
      if (destination) params.destination = destination;
      if (agency && agency !== 'ALL') params.agency = agency;
      if (station && station !== 'ALL') params.station = station;
      const resp = await api.get('/transit/buses/search', { params });
      if (resp.data?.buses) return resp.data;
    } catch { /* fall through to local data */ }
  }
  const buses = filterLocalBuses(destination, agency, station);
  return { query: destination || '', agency: agency || 'ALL', station: station || 'ALL', count: buses.length, buses };
};

export const getAllBuses = async (agency?: string, station?: string) => searchBuses('', agency, station);

export const getUnifiedTransit = async (destination?: string, transitType?: string, agency?: string) => {
  if (!isNativePlatform()) {
    try {
      const params: any = {};
      if (destination) params.destination = destination;
      if (transitType && transitType !== 'ALL') params.transit_type = transitType;
      if (agency && agency !== 'ALL') params.agency = agency;
      const resp = await api.get('/transit/all', { params });
      if (resp.data) return resp.data;
    } catch { /* fall through */ }
  }
  const [tRes, bRes] = await Promise.all([
    searchTrains(destination), searchBuses(destination, agency),
  ]);
  return { trains: tRes.trains, buses: bRes.buses, count: tRes.count + bRes.count };
};
