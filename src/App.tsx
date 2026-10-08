import { useState, useEffect } from 'react';
import { ShieldAlert, CloudRain, ThermometerSun, Shield, Smartphone } from 'lucide-react';
import { EmergencyModal } from './components/EmergencyModal';
import { RoutingPanel } from './components/RoutingPanel';
import { LeafletMap } from './components/LeafletMap';
import { NavigationHUD } from './components/NavigationHUD';
import { watchPosition, getCurrentPosition, isNativePlatform } from './geo';
import { calculateBearing } from './services/navigationEngine';

function App() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [dest, setDest] = useState<[number, number] | null>(null);
  const [originName, setOriginName] = useState<string>('');
  const [destName, setDestName] = useState<string>('');
  const [routesData, setRoutesData] = useState<any>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);

  const handleSetOrigin = (coords: [number, number], name?: string) => {
    setOrigin(coords);
    setUserLocation(coords);
    if (name) setOriginName(name);
  };

  const handleSetDest = (coords: [number, number], name?: string) => {
    setDest(coords);
    if (name) setDestName(name);
  };

  const routes = routesData?.routes || [];
  const activeRoute = routes[selectedRouteIndex] || routes[0];
  const weather = activeRoute?.weather_context;

  // Try to get user location on app load so map centers on user without pre-locking origin
  useEffect(() => {
    getCurrentPosition(6000, true)
      .then((pos) => {
        setUserLocation([pos.latitude, pos.longitude]);
      })
      .catch((err) => {
        console.warn('Initial location fetch failed:', err);
      });
  }, []);

  // Track location during navigation using Capacitor-safe watchPosition
  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const cleanup = watchPosition(
      (pos) => {
        const newLat = pos.latitude;
        const newLon = pos.longitude;
        setUserLocation((prev) => {
          if (prev) {
            const h = calculateBearing(prev[0], prev[1], newLat, newLon);
            if (h !== 0) setUserHeading(h);
          }
          return [newLat, newLon];
        });
      },
      (err) => {
        console.error('Error tracking location:', err);
        if (origin) setUserLocation(origin);
      }
    );

    return cleanup;
  }, [isNavigating, origin]);

  // Handle position changes from Simulation Mode in NavigationHUD
  const handleSimulatePositionChange = (pos: [number, number], heading: number) => {
    setUserLocation(pos);
    setUserHeading(heading);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    if (!userLocation && origin) {
      setUserLocation(origin);
    }
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden relative font-sans text-slate-900 bg-slate-950">
      {/* Permanent Fixed Top Header Bar - ALWAYS Visible at z-[100], NEVER hidden or overlapped */}
      {!isNavigating && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-[100] px-3 sm:px-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 p-1.5 rounded-xl border border-emerald-500/40">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent leading-none">
                KumariSafe
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Emergency & Transit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Weather mini pill if available */}
            {weather && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full text-xs text-slate-300">
                {weather.weather_condition?.includes('Rain') ? <CloudRain className="w-3.5 h-3.5 text-blue-400" /> : <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="font-semibold">{weather.temperature_c}°C</span>
              </div>
            )}

            {/* UN-COVERABLE SOS EMERGENCY BUTTON */}
            <button 
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-lg shadow-rose-600/40 border border-rose-400 flex items-center gap-1.5 animate-pulse cursor-pointer shrink-0"
              title="Open Emergency Services Directory"
            >
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              <span>SOS EMERGENCY</span>
            </button>

            {/* DOWNLOAD ANDROID APK (Showcased on Web / Vercel) */}
            {!isNativePlatform() && (
              <a 
                href="/KumariSafe.apk"
                download="KumariSafe.apk"
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-full shadow-lg shadow-emerald-900/40 border border-emerald-400 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                title="Download KumariSafe Android APK"
              >
                <Smartphone className="w-4 h-4 text-emerald-100 shrink-0" />
                <span className="hidden xs:inline sm:inline">Download APK</span>
              </a>
            )}
          </div>
        </header>
      )}

      {/* Ultra-Fast, 100% Reliable 2D Leaflet Map with Public OpenStreetMap Tiles */}
      <LeafletMap
        origin={origin}
        dest={dest}
        userLocation={userLocation}
        userHeading={userHeading}
        routes={routes}
        selectedRouteIndex={selectedRouteIndex}
        onSelectRouteIndex={setSelectedRouteIndex}
        isNavigating={isNavigating}
        policeStations={activeRoute?.police_stations || activeRoute?.safety_context?.facilities_within_corridor?.filter((f: any) => f.facility?.facility_type === 'POLICE').map((f: any) => f.facility)}
        cctvs={activeRoute?.cctvs || activeRoute?.safety_context?.facilities_within_corridor?.filter((f: any) => f.facility?.facility_type === 'CCTV').map((f: any) => f.facility)}
        hazards={activeRoute?.hazards || activeRoute?.safety_context?.hazards}
        onLocateUser={(coords) => {
          setUserLocation(coords);
        }}
      />

      {/* Real-time Voice Navigation HUD with Turn-by-Turn Guidance & Chime */}
      {isNavigating && activeRoute && (
        <NavigationHUD
          activeRoute={activeRoute}
          userLocation={userLocation}
          onExitNavigation={handleExitNavigation}
          onSimulatePositionChange={handleSimulatePositionChange}
        />
      )}

      {/* Routing & Transit Panel (Collapsible, responsive, sits below top header bar) */}
      {!isNavigating && (
        <RoutingPanel 
          origin={origin} 
          dest={dest} 
          originName={originName} 
          destName={destName} 
          onRoutesFound={(data) => {
            setRoutesData(data);
            setSelectedRouteIndex(0);
          }}
          onMultimodalFound={() => {}}
          routesData={routesData}
          activeRoute={activeRoute}
          selectedRouteIndex={selectedRouteIndex}
          onSelectRouteIndex={setSelectedRouteIndex}
          isNavigating={isNavigating}
          onStartNavigation={handleStartNavigation}
          onExitNavigation={handleExitNavigation}
          onSetOrigin={handleSetOrigin}
          onSetDest={handleSetDest}
        />
      )}

      {/* Emergency Assistance Modal */}
      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
        userLocation={origin}
      />
    </div>
  );
}

export default App;
