import React, { useState } from 'react';
import { MapPin, Navigation, ShieldCheck, Clock, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { getDirections, getMultimodalHubs } from '../api';

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
  onExitNavigation
}) => {
  const [loading, setLoading] = useState(false);
  const [preference, setPreference] = useState<'FASTEST' | 'SAFEST' | 'BALANCED'>('BALANCED');
  const [profile, setProfile] = useState<'driving' | 'walking' | 'cycling' | 'transit'>('driving');

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
    <div className={`absolute w-full p-6 pb-8 bg-slate-900/90 text-white backdrop-blur-2xl transition-all duration-500 ease-in-out pointer-events-auto z-50 flex flex-col overflow-y-auto shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] border-slate-700/50
                    ${isNavigating 
                      ? 'top-0 left-0 right-0 rounded-b-[2.5rem] md:w-full md:rounded-none max-h-[30vh] border-b bg-emerald-900/90' 
                      : 'bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t md:bottom-auto md:top-6 md:left-6 md:w-[420px] md:rounded-3xl md:border max-h-[85vh]'}`}>
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
        <button
          onClick={() => onSetMode('ORIGIN')}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            selectionMode === 'ORIGIN' ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/80'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-blue-400" /></div>
            <span className="text-sm font-semibold text-slate-200">
              {origin ? `${origin[0].toFixed(4)}, ${origin[1].toFixed(4)}` : 'Tap map to set origin'}
            </span>
          </div>
          {selectionMode === 'ORIGIN' && <span className="text-xs text-blue-400 font-bold uppercase tracking-wider animate-pulse">Selecting...</span>}
        </button>

        <button
          onClick={() => onSetMode('DEST')}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            selectionMode === 'DEST' ? 'bg-emerald-900/40 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/80'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-emerald-400" /></div>
            <span className="text-sm font-semibold text-slate-200">
              {dest ? `${dest[0].toFixed(4)}, ${dest[1].toFixed(4)}` : 'Tap map to set destination'}
            </span>
          </div>
          {selectionMode === 'DEST' && <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider animate-pulse">Selecting...</span>}
        </button>
      </div>

      <div className="flex gap-2 mb-4 bg-slate-800 p-1.5 rounded-2xl shrink-0 border border-slate-700">
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
              preference === pref ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {pref}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 bg-slate-800 p-1.5 rounded-2xl shrink-0 border border-slate-700">
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
              profile === mod ? 'bg-emerald-600 shadow-lg text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      <button
        onClick={handleSearch}
        disabled={!origin || !dest || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] shrink-0 text-lg"
      >
        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Navigation className="w-6 h-6" />}
        {loading ? 'Analyzing Routes...' : 'Get Directions'}
      </button>

      {/* Route Info Section */}
      {activeRoute && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 shrink-0">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400 w-5 h-5" />
            Recommended Route
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
              <div className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Time</div>
              <div className="text-2xl font-black text-white">{Math.round(activeRoute.duration_minutes)} <span className="text-sm font-semibold text-slate-400">min</span></div>
              <div className="text-sm text-slate-400 font-semibold">{activeRoute.distance_km.toFixed(1)} km</div>
            </div>
            
            <div className="bg-emerald-900/20 rounded-2xl p-4 border border-emerald-500/30">
              <div className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Safety Score</div>
              <div className="text-2xl font-black text-emerald-400">{Math.round(activeRoute.score)}<span className="text-sm font-semibold text-emerald-600/70">/100</span></div>
              <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mt-1">{activeRoute.label}</div>
            </div>
          </div>
          
           {activeRoute.safety_context && profile !== 'transit' && (
             <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-6">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Safety Intelligence</p>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-300">Police Stations</span>
                 <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.police_stations_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-300">Hospitals</span>
                 <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.hospitals_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-300">CCTV Cameras</span>
                 <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.cctv_count}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-semibold">
                 <span className="text-slate-300">Road Hazards</span>
                 <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg">{activeRoute.safety_context.road_hazards_count}</span>
               </div>
               
               {activeRoute.safety_context.facilities_within_corridor && activeRoute.safety_context.facilities_within_corridor.filter((f: any) => f.facility.phone).length > 0 && (
                 <div className="mt-4 pt-4 border-t border-slate-700">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Emergency Contacts</p>
                   {activeRoute.safety_context.facilities_within_corridor
                     .filter((f: any) => f.facility.phone)
                     .slice(0, 3)
                     .map((f: any, idx: number) => (
                     <div key={idx} className="flex justify-between items-center text-sm font-semibold mb-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                       <span className="text-slate-300 truncate mr-2" title={f.facility.name}>{f.facility.name}</span>
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
             <div className="space-y-3 bg-indigo-900/20 p-4 rounded-2xl border border-indigo-500/30 mb-6">
               <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Navigation className="w-3.5 h-3.5"/> Transit Timetable (Trains & KSRTC)</p>
               
               <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                 <div className="flex justify-between items-center mb-1">
                   <span className="font-bold text-white flex items-center gap-2"><span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-md">Train 16382</span> CAPE PUNE EXP</span>
                   <span className="text-emerald-400 font-bold animate-pulse text-sm">08:40 AM</span>
                 </div>
                 <p className="text-xs text-slate-400">Departs from Nagercoil Jn (NCJ)</p>
               </div>
               
               <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 opacity-60">
                 <div className="flex justify-between items-center mb-1">
                   <span className="font-bold text-white flex items-center gap-2"><span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-md">KSRTC Fast</span> TRV-FAST-01</span>
                   <span className="text-red-400 font-bold text-sm">06:00 AM</span>
                 </div>
                 <p className="text-xs text-slate-400">Kanyakumari → Trivandrum Central</p>
                 <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-500">Stops: Nagercoil Vadasery, Thuckalay, Marthandam, Kaliyakkavilai, Neyyattinkara</p>
                 </div>
               </div>
             </div>
           )}
           
           <button
             onClick={onStartNavigation}
             className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] text-lg"
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
              <div key={idx} className="flex-none w-72 flex gap-4 items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-lg snap-start backdrop-blur-sm">
                <div className="bg-emerald-500/10 p-3.5 rounded-xl shrink-0 border border-emerald-500/20">
                  <Icon className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-lg leading-tight line-clamp-2">{step.instruction}</p>
                  <p className="text-sm font-black text-emerald-500 mt-1.5 uppercase tracking-wider">
                    {Math.round(step.distance_meters)}m
                  </p>
                </div>
              </div>
            );
          })}
          {(!activeRoute.steps || activeRoute.steps.length === 0) && (
            <p className="text-slate-400 text-sm py-4 font-semibold italic">Calculating detailed steps...</p>
          )}
        </div>
      </div>
    )}
    </div>
  );
};
