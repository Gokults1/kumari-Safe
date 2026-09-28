import React, { useState, useEffect } from 'react';
import { Search, Navigation, ShieldAlert, Car, Footprints, ArrowRight } from 'lucide-react';
import Map3D from './components/Map3D';
import AnimatedAvatar from './components/AnimatedAvatar';
import 'mapbox-gl/dist/mapbox-gl.css';

type Mode = 'driving' | 'walking';

function App() {
  const [mode, setMode] = useState<Mode>('driving');
  
  // Dummy state for avatar animation
  const [avatarPos, setAvatarPos] = useState({ lat: 8.1833, lng: 77.4119, bearing: 45 });

  // Simulate smooth GPS updates gliding the avatar forward
  useEffect(() => {
    const interval = setInterval(() => {
      setAvatarPos(prev => {
        // Move slightly northeast
        const newLat = prev.lat + 0.0001;
        const newLng = prev.lng + 0.0001;
        return { lat: newLat, lng: newLng, bearing: prev.bearing };
      });
    }, 1000); // Update every second to test the 1s linear transition
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100">
      
      {/* 3D Map Base */}
      <Map3D>
        <AnimatedAvatar 
          latitude={avatarPos.lat} 
          longitude={avatarPos.lng} 
          bearing={avatarPos.bearing} 
          mode={mode} 
        />
      </Map3D>

      {/* Emergency Pill (Top Right) */}
      <div className="absolute top-12 right-6 z-50">
        <button className="flex items-center gap-2 bg-red-600/90 backdrop-blur-xl text-white px-5 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/50 transition-transform active:scale-95">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>SOS</span>
        </button>
      </div>

      {/* Transport Mode Selector (Top Left / Center-ish) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl">
        <button
          onClick={() => setMode('driving')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
            mode === 'driving' 
              ? 'bg-white text-slate-900 shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Car className="w-4 h-4" />
          Drive
        </button>
        <button
          onClick={() => setMode('walking')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
            mode === 'walking' 
              ? 'bg-white text-slate-900 shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Footprints className="w-4 h-4" />
          Walk
        </button>
      </div>

      {/* Frosted Glass Bottom/Side Panel for Inputs */}
      <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-96 z-50 bg-slate-900/70 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        
        <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-6">
          KumariSafe 3D
        </h1>

        <div className="space-y-4 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-700/50" />

          {/* Origin Input */}
          <div className="relative flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-2 pl-4 focus-within:bg-black/60 focus-within:border-white/20 transition-colors">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10" />
            <input 
              type="text" 
              placeholder="Current Location" 
              className="bg-transparent border-none outline-none text-white placeholder-slate-500 flex-1 py-2"
              defaultValue="Nagercoil"
            />
          </div>

          {/* Destination Input */}
          <div className="relative flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-2 pl-4 focus-within:bg-black/60 focus-within:border-white/20 transition-colors">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10" />
            <input 
              type="text" 
              placeholder="Where to?" 
              className="bg-transparent border-none outline-none text-white placeholder-slate-500 flex-1 py-2"
            />
            <button className="bg-white/10 p-2 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Navigation className="w-5 h-5" />
          Let's Go
        </button>

      </div>
    </div>
  );
}

export default App;
