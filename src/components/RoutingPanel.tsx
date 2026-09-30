import React, { useState } from 'react';
import { Navigation, ShieldCheck, Clock, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Search, Train } from 'lucide-react';
import { getDirections, getMultimodalHubs, searchTrains } from '../api';

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

  // Debounced live suggestions from free OpenStreetMap Photon API
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
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
    const name = p.name || p.street || 'Selected Location';
    setQuery(name);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(coords);
    }
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
        if (feats.length > 0) {
          setShowSuggestions(true);
        }
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
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => {
              // Delay hide so suggestion click can fire
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={value ? "Selected" : placeholder} 
            className="w-full bg-white px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
          />

          {/* Floating suggestion list directly underneath the active input box */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
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
                    className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
      {value && <div className="text-xs font-semibold text-slate-500 truncate mt-2 text-center">{value}</div>}
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
  const [trainQuery, setTrainQuery] = useState('');
  const [trainResults, setTrainResults] = useState<any[]>([]);
  const [trainSearching, setTrainSearching] = useState(false);
  const [trainDirection, setTrainDirection] = useState<'ALL' | 'DEPARTING' | 'ARRIVING'>('ALL');
  const [trainStation, setTrainStation] = useState<'ALL' | 'NCJ' | 'CAPE' | 'NCT'>('ALL');

  const fetchTrains = async (query = trainQuery, dir = trainDirection, stn = trainStation) => {
    setTrainSearching(true);
    try {
      const res = await searchTrains(query.trim() || undefined, dir, stn);
      setTrainResults(res?.trains || []);
    } catch (err) {
      console.error('Train search failed:', err);
      setTrainResults([]);
    }
    setTrainSearching(false);
  };

  const handleTrainSearch = (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : trainQuery;
    fetchTrains(q, trainDirection, trainStation);
  };

  React.useEffect(() => {
    if (profile === 'transit') {
      fetchTrains(trainQuery, trainDirection, trainStation);
    }
  }, [profile, trainDirection, trainStation]);

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
              onSelect={onSetDest} 
              value={dest ? `${dest[0].toFixed(4)}, ${dest[1].toFixed(4)}` : null} 
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
              <div className="space-y-3 bg-indigo-50/90 p-4 rounded-2xl border border-indigo-200 mb-6">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-indigo-600"/> Trains (NCJ / CAPE / NCT)
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {trainResults.length} Available
                  </span>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trainQuery}
                    onChange={(e) => setTrainQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrainSearch()}
                    placeholder="Search place or route (Chennai, Bangalore, Trivandrum, Delhi...)"
                    className="flex-1 bg-white px-3 py-2 rounded-xl text-xs border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 placeholder:text-slate-400 shadow-xs"
                  />
                  <button
                    onClick={() => handleTrainSearch()}
                    disabled={trainSearching}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {trainSearching ? '...' : 'Search'}
                  </button>
                  {trainQuery && (
                    <button
                      onClick={() => { setTrainQuery(''); handleTrainSearch(''); }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-2 rounded-xl text-xs font-bold transition-colors"
                      title="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Popular Destination Quick Pills */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick:</span>
                  {['Chennai', 'Bangalore', 'Trivandrum', 'Mumbai', 'Delhi', 'Madurai', 'Coimbatore', 'Ernakulam', 'Dibrugarh'].map((city) => (
                    <button
                      key={city}
                      onClick={() => { setTrainQuery(city); handleTrainSearch(city); }}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                        trainQuery.toLowerCase() === city.toLowerCase()
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Direction Filter Tabs */}
                <div className="flex gap-1 bg-indigo-100/70 p-1 rounded-xl">
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
                          ? 'bg-white text-indigo-900 shadow-xs'
                          : 'text-indigo-700 hover:text-indigo-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Station Filter Pills */}
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

                {/* Results List */}
                {trainSearching ? (
                  <div className="text-center py-6 text-indigo-600 text-xs font-semibold flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    Finding trains...
                  </div>
                ) : trainResults.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs bg-white rounded-xl border border-slate-200 p-3">
                    No trains found for this selection. Try clearing filters or searching another destination.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {trainResults.map((train: any, idx: number) => {
                      const isGoing = train.direction === 'DEPARTING';
                      return (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs hover:border-indigo-300 transition-colors">
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
