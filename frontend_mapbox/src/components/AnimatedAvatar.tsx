import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { CarFront, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedAvatarProps {
  latitude: number;
  longitude: number;
  bearing: number;
  mode: 'walking' | 'driving';
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ latitude, longitude, bearing, mode }) => {
  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      style={{
        transition: 'transform 1s linear',
        zIndex: 50,
      }}
    >
      <div 
        style={{ transform: `rotate(${bearing}deg)` }}
        className="relative transition-transform duration-1000 ease-linear"
      >
        {mode === 'driving' ? (
          <div className="relative flex items-center justify-center w-12 h-12">
            {/* Driving shadow / glow */}
            <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full transform scale-150" />
            <div className="relative bg-gradient-to-t from-slate-800 to-slate-900 border border-slate-700 shadow-xl rounded-full p-2 flex items-center justify-center z-10">
              <CarFront className="w-6 h-6 text-blue-400" />
            </div>
            {/* Stylized headlight beams */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-blue-400/50 to-transparent blur-sm rounded-full -z-10" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-10 h-10">
            {/* Radar sweep / pulse */}
            <div className="absolute inset-0 bg-emerald-500/40 rounded-full animate-ping" />
            <div className="absolute -inset-4 border border-emerald-500/30 rounded-full animate-pulse" />
            
            <div className="relative bg-emerald-500 border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.8)] rounded-full p-1.5 flex items-center justify-center z-10">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* Direction indicator for walking */}
            <div className="absolute -top-1 w-2 h-2 bg-white rounded-full shadow-sm z-20" />
          </div>
        )}
      </div>
    </Marker>
  );
};

export default AnimatedAvatar;
