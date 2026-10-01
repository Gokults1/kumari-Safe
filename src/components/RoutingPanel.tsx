import React, { useState } from 'react';
import { Navigation, ShieldCheck, Clock, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Search, Train, Bus, MapPin, Sparkles, LocateFixed } from 'lucide-react';
import { getDirections, getMultimodalHubs, searchTrains, searchBuses } from '../api';

// Utility to clean place names for transit search (e.g. "Trivandrum Central, Kerala" -> "Trivandrum")
export function extractCleanPlace(str: string): string {
  if (!str) return '';
  const first = str.split(/[,/\\-]/)[0].trim();
  return first;
}

// Transport badge parser for OpenStreetMap Photon suggestions
export function getTransportBadge(properties: any): { text: string; className: string } {
  const name = (properties?.name || '').toLowerCase();
  const osmVal = (properties?.osm_value || '').toLowerCase();
  const osmKey = (properties?.osm_key || '').toLowerCase();
  const textToCheck = `${name} ${osmVal} ${osmKey}`;

  // Priority 1: Bus / KSRTC badge
  if (
    textToCheck.includes('bus') ||
    textToCheck.includes('bus_stop') ||
    textToCheck.includes('bus_station') ||
    textToCheck.includes('ksrtc')
  ) {
    return {
      text: 'KSRTC / Bus Stand',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
    };
  }

  // Priority 2: Railway / Train badge
  if (
    textToCheck.includes('train') ||
    textToCheck.includes('railway') ||
    textToCheck.includes('station')
  ) {
    return {
      text: 'Railway / Train',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
    };
  }

  // Priority 3: General street or town location
  return {
    text: 'Location',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  };
}

export const LocationSearch = ({ placeholder, onSelect, value, mode, isActive, onSetMode }: any) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  // Debounced live suggestions from free OpenStreetMap Photon API
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&lat=8.1833&lon=77.4119`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.error('Photon autocomplete error:', e);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (feature: any) => {
    // GeoJSON Point coordinates: [longitude, latitude]
    const coords: [number, number] = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    const p = feature.properties || {};
    const name = p.name || p.street || p.city || 'Selected Location';
    setQuery(name);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(coords, name);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords: [number, number] = [lat, lon];
        let displayName = 'My Current Location';
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const p = data.features?.[0]?.properties;
            if (p?.name || p?.street || p?.city) {
              displayName = [p.name || p.street, p.city || p.district].filter(Boolean).join(', ');
            }
          }
        } catch (e) {
          console.error('Reverse geocode error:', e);
        }
        setQuery(displayName);
        setShowSuggestions(false);
        if (onSelect) {
          onSelect(coords, displayName);
        }
        setLocating(false);
      },
      (err) => {
        console.error('Location error:', err);
        alert('Could not access current location. Please check browser GPS permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&lat=8.1833&lon=77.4119`);
      if (res.ok) {
        const data = await res.json();
        const feats = data.features || [];
        setSuggestions(feats);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  return (
    <div className={`relative w-full flex flex-col p-4 rounded-2xl border transition-all ${isActive ? 'bg-slate-100 ring-2 ring-blue-500/30' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex gap-2 items-center">
        <button 
          type="button"
          onClick={() => onSetMode(mode)} 
          className="text-xs p-2 bg-blue-100 hover:bg-blue-200 transition-colors rounded-lg text-blue-700 font-bold whitespace-nowrap"
        >
          {isActive ? 'Tap Map' : 'Map'}
        </button>

        <div className="relative flex-1">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hide so suggestion click can fire
              setTimeout(() => setShowSuggestions(false), 250);
            }}
            placeholder={value ? "Selected" : placeholder} 
            className="w-full bg-white px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
          />

          {/* Floating suggestion list directly underneath the active input box */}
          {showSuggestions && (
            <div className="absolute z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-lg left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-800">
              {/* Option 1: Top My Current Location Action - ONLY for ORIGIN */}
              {mode === 'ORIGIN' && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUseCurrentLocation();
                  }}
                  className="w-full text-left p-2.5 bg-slate-800/90 hover:bg-emerald-950/80 transition-colors flex items-center justify-between gap-2 text-white border-b border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <LocateFixed className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300">Use My Current Location</p>
                      <p className="text-[10px] text-slate-400">GPS location from this device</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">
                    GPS
                  </span>
                </button>
              )}

              {suggestions.map((feature: any, idx: number) => {
                const p = feature.properties || {};
                const badge = getTransportBadge(p);
                const title = p.name || p.street || 'Place';
                const subtitle = [p.locality, p.district, p.city, p.state].filter(Boolean).join(', ');

                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      // Prevent blur before click executes
                      e.preventDefault();
                      handleSelectSuggestion(feature);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 text-white"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap ${badge.className}`}>
                      [{badge.text}]
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button 
          type="button"
          onClick={handleSearch} 
          disabled={searching} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {/* Pushed down below search: My Current Location button for ORIGIN */}
      {mode === 'ORIGIN' ? (
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
            <span>{locating ? 'Acquiring GPS...' : '📍 Use My Current Location'}</span>
          </button>
          {value && (
            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[180px]" title={value}>
              {value}
            </span>
          )}
        </div>
      ) : (
        value && <div className="text-xs font-semibold text-slate-500 truncate mt-2 text-center">{value}</div>
      )}
    </div>
  );
};

interface RoutingPanelProps {
  origin: [number, number] | null;
  dest: [number, number] | null;
  onSetMode: (mode: 'ORIGIN' | 'DEST' | null) => void;
  selectionMode: 'ORIGIN' | 'DEST' | null;
  onRoutesFound: (data: any) => void;
  onMultimodalFound: (data: any) => void;
  activeRoute?: any;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onExitNavigation: () => void;
  onSetOrigin?: (latlng: [number, number]) => void;
  onSetDest?: (latlng: [number, number]) => void;
}

export const RoutingPanel: React.FC<RoutingPanelProps> = ({
  origin,
  dest,
  onSetMode,
  selectionMode,
  onRoutesFound,
  onMultimodalFound,
  activeRoute,
  isNavigating,
  onStartNavigation,
  onExitNavigation,
  onSetOrigin,
  onSetDest
}) => {
  const [loading, setLoading] = useState(false);
  const [preference, setPreference] = useState<'FASTEST' | 'SAFEST' | 'BALANCED'>('BALANCED');
  const [profile, setProfile] = useState<'driving' | 'walking' | 'cycling' | 'transit'>('driving');
  
  // Transit state (KSRTC, SETC/TNSTC, and Trains)
  const [destPlace, setDestPlace] = useState('');
  const [transitTab, setTransitTab] = useState<'ALL' | 'BUS' | 'TRAIN'>('ALL');
  const [busAgency, setBusAgency] = useState<'ALL' | 'KSRTC' | 'TNSTC'>('ALL');
  const [transitQuery, setTransitQuery] = useState('');
  const [trainResults, setTrainResults] = useState<any[]>([]);
  const [busResults, setBusResults] = useState<any[]>([]);
  const [transitSearching, setTransitSearching] = useState(false);
  const [trainDirection, setTrainDirection] = useState<'ALL' | 'DEPARTING' | 'ARRIVING'>('ALL');
  const [trainStation, setTrainStation] = useState<'ALL' | 'NCJ' | 'CAPE' | 'NCT'>('ALL');

  const fetchTransit = async (
    query = transitQuery, 
    tab = transitTab, 
    agency = busAgency, 
    dir = trainDirection, 
    stn = trainStation
  ) => {
    setTransitSearching(true);
    try {
      const q = query.trim() || undefined;
      const promises: Promise<any>[] = [];

      if (tab === 'ALL' || tab === 'TRAIN') {
        promises.push(searchTrains(q, dir, stn));
      } else {
        promises.push(Promise.resolve({ trains: [] }));
      }

      if (tab === 'ALL' || tab === 'BUS') {
        promises.push(searchBuses(q, agency, undefined));
      } else {
        promises.push(Promise.resolve({ buses: [] }));
      }

      const [trainRes, busRes] = await Promise.all(promises);
      setTrainResults(trainRes?.trains || []);
      setBusResults(busRes?.buses || []);
    } catch (err) {
      console.error('Transit search failed:', err);
    }
    setTransitSearching(false);
  };

    const handleTransitNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setTransitSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Nearest major hub in Kanniyakumari district
        const hubs = [
          { name: 'Nagercoil', lat: 8.1923, lon: 77.4300 },
          { name: 'Kanyakumari', lat: 8.0864, lon: 77.5502 },
          { name: 'Marthandam', lat: 8.3039, lon: 77.2185 },
          { name: 'Thuckalay', lat: 8.2482, lon: 77.3298 },
          { name: 'Trivandrum', lat: 8.4875, lon: 76.9525 }
        ];
        let nearest = hubs[0];
        let minDist = Infinity;
        for (const h of hubs) {
          const d = Math.hypot(lat - h.lat, lon - h.lon);
          if (d < minDist) {
            minDist = d;
            nearest = h;
          }
        }
        setTransitQuery(nearest.name);
        fetchTransit(nearest.name, transitTab, busAgency, trainDirection, trainStation);
      },
      (err) => {
        console.error(err);
        setTransitQuery('Nagercoil');
        fetchTransit('Nagercoil', transitTab, busAgency, trainDirection, trainStation);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

const handleTransitSearch = (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : transitQuery;
    fetchTransit(q, transitTab, busAgency, trainDirection, trainStation);
  };

  React.useEffect(() => {
    if (profile === 'transit') {
      fetchTransit(transitQuery, transitTab, busAgency, trainDirection, trainStation);
    }
  }, [profile, transitTab, busAgency, trainDirection, trainStation]);

  const handleDestinationSelected = (coords: [number, number], name?: string) => {
    if (onSetDest) {
      onSetDest(coords);
    }
    if (name) {
      const clean = extractCleanPlace(name);
      setDestPlace(clean);
      setTransitQuery(clean);
      fetchTransit(clean, transitTab, busAgency, trainDirection, trainStation);
    }
  };

  const handleSearch = async () => {
    if (!origin || !dest) return;
    setLoading(true);
    try {
      const routeData = await getDirections(origin, dest, preference, profile);
      onRoutesFound(routeData);
      
      try {
        const multimodalData = await getMultimodalHubs(origin, dest);
        onMultimodalFound(multimodalData);
      } catch (err) {
        console.error("Multimodal fetch failed:", err);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to find routes");
    }
    setLoading(false);
  };

  return (
    <div className={`transition-all duration-500 ease-in-out pointer-events-auto z-50 flex flex-col overflow-y-auto
                    ${isNavigating 
                      ? 'absolute top-0 left-0 right-0 rounded-b-[2.5rem] w-full max-h-[30vh] border-b bg-emerald-900/90 p-6 pb-8 text-slate-900 backdrop-blur-2xl' 
                      : 'absolute top-6 left-6 w-[400px] p-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 max-h-[90vh]'}`}>
      {!isNavigating && (
        <>
          <div className="drag-handle"></div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 shrink-0 tracking-tight">
            KumariSafe
          </h1>
        </>
      )}
      
      {!isNavigating && (
        <>
          <div className="space-y-4 mb-6 shrink-0">
            <LocationSearch 
              placeholder="Search origin..." 
              onSelect={onSetOrigin} 
              value={origin ? `${origin[0].toFixed(4)}, ${origin[1].toFixed(4)}` : null} 
              mode="ORIGIN" 
              isActive={selectionMode === 'ORIGIN'} 
              onSetMode={onSetMode} 
            />
            <LocationSearch 
              placeholder="Search destination..." 
              onSelect={handleDestinationSelected} 
              value={dest ? (destPlace || `${dest[0].toFixed(4)}, ${dest[1].toFixed(4)}`) : null} 
              mode="DEST" 
              isActive={selectionMode === 'DEST'} 
              onSetMode={onSetMode} 
            />
          </div>

      <div className="flex gap-2 mb-4 bg-slate-50 p-1.5 rounded-2xl shrink-0 border border-slate-100">
        {['FASTEST', 'BALANCED', 'SAFEST'].map((pref) => (
          <button
            key={pref}
            onClick={async () => {
              setPreference(pref as any);
              if (origin && dest) {
                setLoading(true);
                try {
                  const routeData = await getDirections(origin, dest, pref as any, profile);
                  onRoutesFound(routeData);
                } catch (err) {
                  console.error(err);
                }
                setLoading(false);
              }
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
              preference === pref ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-700'
            }`}
          >
            {pref}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl shrink-0 border border-slate-100">
        {['driving', 'cycling', 'walking', 'transit'].map((mod) => (
          <button
            key={mod}
            onClick={async () => {
              setProfile(mod as any);
              if (origin && dest) {
                setLoading(true);
                try {
                  const routeData = await getDirections(origin, dest, preference, mod as any);
                  onRoutesFound(routeData);
                } catch (err) {
                  console.error(err);
                }
                setLoading(false);
              }
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 capitalize ${
              profile === mod ? 'bg-emerald-600 shadow-lg text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-700'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      <button
        onClick={handleSearch}
        disabled={!origin || !dest || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] shrink-0 text-lg"
      >
        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Navigation className="w-6 h-6" />}
        {loading ? 'Analyzing Routes...' : 'Get Directions'}
      </button>

      {/* Route Info Section */}
      {activeRoute && (
        <div className="mt-6 pt-6 border-t border-slate-100 shrink-0">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400 w-5 h-5" />
            Recommended Route
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 border border-slate-100">
              <div className="text-slate-500 text-xs font-bold mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Time</div>
              <div className="text-2xl font-black text-slate-900">{Math.round(activeRoute.duration_minutes)} <span className="text-sm font-semibold text-slate-500">min</span></div>
              <div className="text-sm text-slate-500 font-semibold">{activeRoute.distance_km.toFixed(1)} km</div>
            </div>
            
            <div className="bg-emerald-900/20 rounded-2xl p-4 border border-emerald-500/30">
              <div className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Safety Score</div>
              <div className="text-2xl font-black text-emerald-400">{Math.round(activeRoute.score)}<span className="text-sm font-semibold text-emerald-600/70">/100</span></div>
              <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mt-1">{activeRoute.label}</div>
            </div>
          </div>
          
           {activeRoute.safety_context && profile !== 'transit' && (
             <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl border border-slate-100 mb-6">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Safety Intelligence</p>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-600">Police Stations</span>
                 <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.police_stations_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-600">Hospitals</span>
                 <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.hospitals_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-600">CCTV Cameras</span>
                 <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.cctv_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-600">Road Hazards</span>
                 <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.road_hazards_count}</span>
               </div>
               
               {activeRoute.safety_context.facilities_within_corridor && activeRoute.safety_context.facilities_within_corridor.filter((f: any) => f.facility.phone).length > 0 && (
                 <div className="mt-4 pt-4 border-t border-slate-100">
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Emergency Contacts</p>
                   {activeRoute.safety_context.facilities_within_corridor
                     .filter((f: any) => f.facility.phone)
                     .slice(0, 3)
                     .map((f: any, idx: number) => (
                     <div key={idx} className="flex justify-between items-center text-sm font-semibold mb-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl border border-slate-100">
                       <span className="text-slate-600 truncate mr-2" title={f.facility.name}>{f.facility.name}</span>
                       <a href={`tel:${f.facility.phone}`} className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg shrink-0 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors shadow-lg">
                         {f.facility.phone}
                       </a>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

            {profile === 'transit' && (
              <div className="space-y-3 bg-gradient-to-br from-indigo-50/95 via-sky-50/90 to-emerald-50/90 p-4 rounded-2xl border border-indigo-200 shadow-sm mb-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-emerald-600"/>
                    <Train className="w-4 h-4 text-indigo-600"/>
                    Transit (Buses & Trains)
                  </p>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white/80 border border-indigo-200 px-2 py-0.5 rounded-full">
                    {trainResults.length + busResults.length} Found
                  </span>
                </div>

                {/* Auto-detected Destination Banner */}
                {destPlace && (
                  <div className="bg-emerald-100/80 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-semibold text-[11px] text-emerald-800">Filtered for your destination:</span>
                        <div className="font-bold text-emerald-900">{destPlace}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setDestPlace(''); setTransitQuery(''); handleTransitSearch(''); }}
                      className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      Show All
                    </button>
                  </div>
                )}

                {/* Transit Type Filter Tabs */}
                <div className="flex gap-1 bg-white/80 p-1 rounded-xl border border-indigo-100 shadow-2xs">
                  {[
                    { id: 'ALL', label: `All (${trainResults.length + busResults.length})` },
                    { id: 'BUS', label: `Buses (${busResults.length})` },
                    { id: 'TRAIN', label: `Trains (${trainResults.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTransitTab(tab.id as any)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        transitTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-indigo-800 hover:bg-indigo-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Bus Agency Selector (KSRTC Kerala vs SETC/TNSTC Tamil Nadu) */}
                {transitTab !== 'TRAIN' && (
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px] text-slate-500 font-bold mr-1 shrink-0">Operator:</span>
                    {[
                      { id: 'ALL', label: 'All Buses' },
                      { id: 'KSRTC', label: 'KSRTC (Kerala)' },
                      { id: 'TNSTC', label: 'SETC / TNSTC (Tamil Nadu)' },
                    ].map((ag) => (
                      <button
                        key={ag.id}
                        onClick={() => setBusAgency(ag.id as any)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border ${
                          busAgency === ag.id
                            ? ag.id === 'KSRTC'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : ag.id === 'TNSTC'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {ag.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Bar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={transitQuery}
                    onChange={(e) => setTransitQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTransitSearch()}
                    placeholder="Search destination (Trivandrum, Chennai, Bangalore, Madurai, Ernakulam...)"
                    className="flex-1 bg-white px-3 py-2 rounded-xl text-xs border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder:text-slate-400 shadow-xs"
                  />
                  <button
                    onClick={() => handleTransitSearch()}
                    disabled={transitSearching}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {transitSearching ? '...' : 'Search'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTransitNearMe}
                    disabled={transitSearching}
                    title="Find buses and trains near my current location"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Near Me</span>
                  </button>
                  {transitQuery && (
                    <button
                      onClick={() => { setTransitQuery(''); handleTransitSearch(''); }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors"
                      title="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Popular Destination Quick Pills */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick:</span>
                  <button
                    onClick={handleTransitNearMe}
                    className="text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 flex items-center gap-1"
                  >
                    <LocateFixed className="w-3 h-3 text-emerald-700" />
                    <span>Near Me</span>
                  </button>
                  {[
                    'Trivandrum', 
                    'Chennai', 
                    'Bangalore', 
                    'Madurai', 
                    'Kozhikode', 
                    'Ernakulam', 
                    'Coimbatore', 
                    'Ooty', 
                    'Tirupati', 
                    'Kottayam', 
                    'Velankanni'
                  ].map((city) => (
                    <button
                      key={city}
                      onClick={() => { setTransitQuery(city); handleTransitSearch(city); }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                        transitQuery.toLowerCase() === city.toLowerCase()
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Train-only directional & station filters if viewing trains */}
                {transitTab === 'TRAIN' && (
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex gap-1 bg-white/70 p-1 rounded-xl border border-indigo-100">
                      {[
                        { id: 'ALL', label: 'All Trains' },
                        { id: 'DEPARTING', label: 'Going (Departing)' },
                        { id: 'ARRIVING', label: 'Coming (Arriving)' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setTrainDirection(tab.id as any)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            trainDirection === tab.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-indigo-700 hover:text-indigo-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1 items-center justify-between">
                      {[
                        { id: 'ALL', label: 'All Stations' },
                        { id: 'NCJ', label: 'Nagercoil Jn' },
                        { id: 'CAPE', label: 'Kanyakumari' },
                        { id: 'NCT', label: 'Nagercoil Town' },
                      ].map((stn) => (
                        <button
                          key={stn.id}
                          onClick={() => setTrainStation(stn.id as any)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all border ${
                            trainStation === stn.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {stn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results List */}
                {transitSearching ? (
                  <div className="text-center py-6 text-indigo-600 text-xs font-semibold flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    Finding buses and trains...
                  </div>
                ) : (trainResults.length === 0 && busResults.length === 0) ? (
                  <div className="text-center py-6 text-slate-500 text-xs bg-white rounded-xl border border-slate-200 p-4">
                    <p className="font-bold text-slate-700 mb-1">No services found for &quot;{transitQuery || 'selection'}&quot;</p>
                    <p className="text-[11px] text-slate-500">
                      Try selecting another quick city pill above or clear the filter to see all KSRTC, SETC, and train schedules.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {/* Bus Results */}
                    {busResults.map((bus: any, idx: number) => {
                      const isKsrtc = (bus.agency || '').toUpperCase().includes('KSRTC');
                      const busNum = bus.route_number || bus.bus_number || `BUS-${idx+1}`;
                      const fromStop = bus.from_station || bus.from_stop || 'Nagercoil Vadasery';
                      const toStop = bus.to_station || bus.to_stop || '';
                      const fareText = bus.fare || (bus.fare_inr ? `₹${bus.fare_inr}` : '');
                      const boardingStand = bus.kanniyakumari_station || bus.kanniyakumari_stand || bus.from_station_name || fromStop;
                      const viaList = bus.stops || bus.via_stops || [];

                      return (
                        <div 
                          key={`bus-${bus.route_number || bus.bus_id || idx}`}
                          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all"
                        >
                          {/* Top Badges */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wide text-white ${
                                isKsrtc ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}>
                                {isKsrtc ? 'KSRTC Kerala' : 'SETC / TNSTC'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {bus.bus_type}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-500">
                                #{busNum}
                              </span>
                            </div>

                            {fareText && (
                              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                {fareText}
                              </span>
                            )}
                          </div>

                          {/* Route */}
                          <div className="text-xs text-slate-900 mb-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800">{fromStop}</span>
                            <span className="text-slate-400 font-bold">&rarr;</span>
                            <span className="font-extrabold text-indigo-700">{toStop}</span>
                          </div>

                          {/* Timings & Platform */}
                          <div className="flex justify-between items-center flex-wrap gap-1 text-[11px] mb-1.5">
                            <div className="flex gap-2">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Dep: {bus.departure}
                              </span>
                              <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                Arr: {bus.arrival}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {bus.frequency || 'Daily'}
                            </span>
                          </div>

                          {/* Boarding Stand / Hub */}
                          {boardingStand && (
                            <div className="mt-1 mb-1 text-[10px] text-emerald-900 font-semibold bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Boarding Stand: <strong className="text-emerald-950">{boardingStand}</strong></span>
                            </div>
                          )}

                          {/* Via Stops */}
                          {viaList && viaList.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                <span className="font-bold text-slate-700">Via: </span>
                                {viaList.join(' \u2192 ')}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Train Results */}
                    {trainResults.map((train: any, idx: number) => {
                      const isGoing = train.direction === 'DEPARTING';
                      return (
                        <div 
                          key={`train-${train.train_number || idx}`}
                          className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-indigo-700 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-wide">
                                {train.train_number}
                              </span>
                              <span className="font-bold text-slate-900 text-xs leading-snug">
                                {train.train_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isGoing ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isGoing ? 'Going' : 'Coming'}
                              </span>
                              {train.kanniyakumari_station && (
                                <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {train.kanniyakumari_station}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 mb-1.5 flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-indigo-700">{train.from_station_name || train.from_station}</span>
                            <span className="text-slate-400 font-bold">&rarr;</span>
                            <span className="font-bold text-emerald-700">{train.to_station}</span>
                          </div>

                          <div className="flex justify-between items-center flex-wrap gap-1 text-[11px] mb-1.5">
                            <div className="flex gap-2">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                Dep: {train.departure}
                              </span>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Arr: {train.arrival}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {train.days}
                            </span>
                          </div>

                          {train.stops && train.stops.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                <span className="font-bold text-slate-700">Route: </span>
                                {train.stops.map((s: string, sidx: number) => (
                                  <React.Fragment key={sidx}>
                                    <span>{s}</span>
                                    {sidx < train.stops.length - 1 && <span className="text-slate-400 font-bold mx-1">&rarr;</span>}
                                  </React.Fragment>
                                ))}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
           
           <button
             onClick={onStartNavigation}
             className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] text-lg"
           >
             <Navigation className="w-6 h-6" />
             Start Navigation
           </button>
         </div>
       )}
     </>
    )}

    {isNavigating && activeRoute && (
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-emerald-400 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
              <Navigation className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            Active Navigation
          </h2>
          <button
            onClick={onExitNavigation}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-red-500/20 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" /> End Route
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {activeRoute.steps?.map((step: any, idx: number) => {
            let Icon = ArrowUp;
            if (step.modifier?.includes('left')) Icon = ArrowLeft;
            else if (step.modifier?.includes('right')) Icon = ArrowRight;
            else if (step.modifier?.includes('uturn')) Icon = ArrowDown;
            
            return (
              <div key={idx} className="flex-none w-72 flex gap-4 items-center bg-slate-50 border border-slate-100 p-5 rounded-2xl border border-slate-100 shadow-lg snap-start backdrop-blur-sm">
                <div className="bg-emerald-500/10 p-3.5 rounded-xl shrink-0 border border-emerald-500/20">
                  <Icon className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{step.instruction}</p>
                  <p className="text-sm font-black text-emerald-500 mt-1.5 uppercase tracking-wider">
                    {Math.round(step.distance_meters)}m
                  </p>
                </div>
              </div>
            );
          })}
          {(!activeRoute.steps || activeRoute.steps.length === 0) && (
            <p className="text-slate-500 text-sm py-4 font-semibold italic">Calculating detailed steps...</p>
          )}
        </div>
      </div>
    )}
    </div>
  );
};
