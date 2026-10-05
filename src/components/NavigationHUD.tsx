import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  CornerUpLeft, CornerUpRight, Volume2, VolumeX, 
  X, Play, Pause, RotateCcw, CheckCircle2, Shield
} from 'lucide-react';
import { voiceGuidance } from '../services/voiceGuidance';
import { calculateDistanceMeters, calculateBearing, formatDistance, getManeuverType } from '../services/navigationEngine';

interface NavigationHUDProps {
  activeRoute: any;
  userLocation: [number, number] | null;
  onExitNavigation: () => void;
  onSimulatePositionChange?: (pos: [number, number], heading: number) => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  activeRoute,
  userLocation,
  onExitNavigation,
  onSimulatePositionChange
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState<number>(0);
  const [hasAnnounced150m, setHasAnnounced150m] = useState(false);
  const [hasAnnouncedNow, setHasAnnouncedNow] = useState(false);

  const steps = activeRoute?.steps || [];
  const coordinates: [number, number][] = activeRoute?.coordinates || []; // [lon, lat]
  const currentStep = steps[currentStepIndex] || steps[0];
  const nextStep = steps[currentStepIndex + 1];

  // Simulation timer ref
  const simIndexRef = useRef(0);
  const simIntervalRef = useRef<any>(null);

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = voiceGuidance.toggleMute();
    setIsMuted(muted);
  };

  const isSafest = activeRoute?.route_id === 'route_safest' || (activeRoute?.score && activeRoute.score >= 90);

  // Initial welcome voice instruction on navigation start
  useEffect(() => {
    if (steps.length > 0) {
      const first = steps[0];
      const speech = isSafest
        ? `Starting navigation on Safest Route. Staying on main roads and illuminated highways only. Avoiding small streets. ${first.instruction || 'Head forward'}.`
        : `Starting navigation. ${first.instruction || 'Head forward'}.`;
      voiceGuidance.speak(speech, true);
    }
    return () => {
      voiceGuidance.stop();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Update distance to next step when userLocation changes
  useEffect(() => {
    if (!userLocation || !currentStep) return;

    // Maneuver location is [lon, lat] in OSRM
    const turnLoc = currentStep.location;
    if (!turnLoc || turnLoc.length < 2) return;

    const turnLat = turnLoc[1];
    const turnLon = turnLoc[0];
    const dist = calculateDistanceMeters(userLocation[0], userLocation[1], turnLat, turnLon);
    setDistanceToNextTurn(dist);

    // Voice announcement triggers:
    // 1. Approaching turn (~80m - 180m)
    if (dist <= 180 && dist >= 60 && !hasAnnounced150m) {
      voiceGuidance.speak(`In ${Math.round(dist)} meters, ${currentStep.instruction}`);
      setHasAnnounced150m(true);
    }

    // 2. Turn execution (< 30m)
    if (dist <= 30 && !hasAnnouncedNow) {
      voiceGuidance.speak(`${currentStep.instruction} now`);
      setHasAnnouncedNow(true);
    }

    // 3. Step completion detection (< 20m or passed)
    if (dist <= 20) {
      if (currentStepIndex < steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        setHasAnnounced150m(false);
        setHasAnnouncedNow(false);
        // Announce next step
        const next = steps[nextIdx];
        voiceGuidance.speak(`Then ${next.instruction}`);
      } else {
        voiceGuidance.speak('You have arrived at your destination.', true);
      }
    }
  }, [userLocation, currentStepIndex, currentStep, hasAnnounced150m, hasAnnouncedNow, steps]);

  // Simulation mode (Test Drive)
  const handleToggleSimulation = () => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      if (coordinates.length === 0) return;

      simIndexRef.current = 0;
      simIntervalRef.current = setInterval(() => {
        if (simIndexRef.current >= coordinates.length - 1) {
          clearInterval(simIntervalRef.current);
          setIsSimulating(false);
          voiceGuidance.speak('You have arrived at your destination.', true);
          return;
        }

        const currPt = coordinates[simIndexRef.current];
        const nextPt = coordinates[Math.min(simIndexRef.current + 1, coordinates.length - 1)];
        const lat = currPt[1];
        const lon = currPt[0];
        const heading = calculateBearing(lat, lon, nextPt[1], nextPt[0]);

        if (onSimulatePositionChange) {
          onSimulatePositionChange([lat, lon], heading);
        }

        simIndexRef.current += 1;
      }, 500); // 1 coordinate every 500ms
    }
  };

  const handleResetSimulation = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsSimulating(false);
    simIndexRef.current = 0;
    setCurrentStepIndex(0);
    setHasAnnounced150m(false);
    setHasAnnouncedNow(false);
    if (coordinates.length > 0 && onSimulatePositionChange) {
      onSimulatePositionChange([coordinates[0][1], coordinates[0][0]], 0);
    }
  };

  // Render Maneuver Icon
  const maneuver = getManeuverType(currentStep?.modifier, currentStep?.maneuver_type);
  const renderManeuverIcon = () => {
    switch (maneuver) {
      case 'left':
      case 'slight_left':
        return <CornerUpLeft className="w-10 h-10 text-emerald-300 animate-pulse" />;
      case 'sharp_left':
        return <ArrowLeft className="w-10 h-10 text-emerald-300 animate-pulse" />;
      case 'right':
      case 'slight_right':
        return <CornerUpRight className="w-10 h-10 text-emerald-300 animate-pulse" />;
      case 'sharp_right':
        return <ArrowRight className="w-10 h-10 text-emerald-300 animate-pulse" />;
      case 'uturn':
        return <ArrowDown className="w-10 h-10 text-amber-300 animate-pulse" />;
      case 'arrive':
        return <CheckCircle2 className="w-10 h-10 text-emerald-300" />;
      default:
        return <ArrowUp className="w-10 h-10 text-emerald-300 animate-pulse" />;
    }
  };

  // Distance display: use real countdown if calculated, or step distance
  const displayDistance = distanceToNextTurn > 0 ? distanceToNextTurn : (currentStep?.distance_meters || 0);

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-auto flex flex-col items-center">
      {/* Top Floating High-Contrast Navigation Banner */}
      <div className="w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/30 text-white shadow-2xl p-4 sm:p-5 rounded-b-3xl">
        {isSafest && (
          <div className="mb-2.5 py-1 px-3 bg-emerald-500/15 border border-emerald-500/40 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-300 tracking-wide uppercase shadow-sm">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Safest Route • Main Arterial Roads Only • Alleys Avoided</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          {/* Giant Maneuver Icon */}
          <div className="bg-emerald-500/20 border-2 border-emerald-400/60 p-3 rounded-2xl shrink-0 shadow-lg flex items-center justify-center">
            {renderManeuverIcon()}
          </div>

          {/* Turn Countdown & Street Instruction */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 tracking-tight">
                {formatDistance(displayDistance)}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                to turn
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-tight truncate mt-0.5">
              {currentStep?.instruction || 'Follow road'}
            </p>
            {currentStep?.street_name && (
              <p className="text-xs font-medium text-emerald-300/80 truncate">
                onto {currentStep.street_name}
              </p>
            )}
          </div>

          {/* Controls: Voice Mute + Exit */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl border transition-all ${
                isMuted 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
              title={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onExitNavigation}
              className="bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-xl font-bold flex items-center gap-1 shadow-lg transition-colors"
              title="Exit Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Next step preview if exists */}
        {nextStep && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Next:</span>
              <span className="text-slate-300 truncate">{nextStep.instruction}</span>
            </span>
            <span className="text-slate-400 font-semibold shrink-0 ml-2">
              in {formatDistance(nextStep.distance_meters)}
            </span>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar: Remaining ETA, Simulation Controls */}
      <div className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-center px-2 border-r border-slate-700">
            <p className="text-xs text-slate-400 font-medium">Remaining</p>
            <p className="text-base font-black text-emerald-400">
              {activeRoute?.distance_km?.toFixed(1) || '0'} km
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-slate-400 font-medium">Est. Time</p>
            <p className="text-base font-black text-white">
              {Math.round(activeRoute?.duration_minutes || 0)} min
            </p>
          </div>
        </div>

        {/* Test Drive / Simulation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              isSimulating 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
            title="Simulate driving along route to test real-time voice and turn detection"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Test' : 'Test Drive'}</span>
          </button>
          {isSimulating && (
            <button
              onClick={handleResetSimulation}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              title="Reset Test Drive"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onExitNavigation}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors ml-1"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};
