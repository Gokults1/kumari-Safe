import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, CloudRain, ThermometerSun } from 'lucide-react';
import { EmergencyModal } from './components/EmergencyModal';
import { RoutingPanel } from './components/RoutingPanel';
import { MapEvents } from './components/MapEvents';
import L from 'leaflet';

import { useMap } from 'react-leaflet';

// Fix for default marker icon in leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function NavCamera({ simLocation, isNavigating }: any) {
  const map = useMap();
  React.useEffect(() => {
    if (isNavigating && simLocation) {
      map.flyTo(simLocation, 18, { animate: true, duration: 0.3 });
    } else if (!isNavigating && simLocation) {
      map.setZoom(13);
    }
  }, [simLocation, isNavigating, map]);
  return null;
}

function App() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [dest, setDest] = useState<[number, number] | null>(null);
  const [selectionMode, setSelectionMode] = useState<'ORIGIN' | 'DEST' | null>(null);
  const [routesData, setRoutesData] = useState<any>(null);
  const [multimodalData, setMultimodalData] = useState<any>(null);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    if (selectionMode === 'ORIGIN') {
      setOrigin([lat, lng]);
      setSelectionMode(null);
    } else if (selectionMode === 'DEST') {
      setDest([lat, lng]);
      setSelectionMode(null);
    }
  };

  const activeRoute = routesData?.routes?.[0];
  const weather = activeRoute?.weather_context;

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  React.useEffect(() => {
    let watchId: number;
    if (isNavigating) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            console.error('Error tracking location:', error);
            // Fallback to origin if GPS is not available/denied
            if (origin) setUserLocation(origin);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        if (origin) setUserLocation(origin);
      }
    } else {
      setUserLocation(null);
    }
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating, origin]);

  const currentNavLocation: [number, number] | null = isNavigating && userLocation 
    ? userLocation 
    : (activeRoute?.coordinates?.length > 0 && origin) 
      ? origin // default to origin if not tracking yet
      : null;

  return (
    <div className="h-[100dvh] w-screen overflow-hidden relative font-sans text-white bg-slate-900">
      {/* Background Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[8.1833, 77.4119]} 
          zoom={13} 
          zoomControl={false}
          className="w-full h-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-map-tiles"
          />
          <MapEvents onClick={handleMapClick} />
          <NavCamera simLocation={currentNavLocation} isNavigating={isNavigating} />
          
          {origin && !isNavigating && <Marker position={origin}><Popup>Origin</Popup></Marker>}
          {dest && !isNavigating && <Marker position={dest}><Popup>Destination</Popup></Marker>}
          
          {/* Navigation Car Marker */}
          {isNavigating && currentNavLocation && (
            <CircleMarker 
              center={currentNavLocation} 
              radius={8} 
              color="#10b981" 
              fillColor="#34d399" 
              fillOpacity={1}
              weight={3}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}

          {routesData?.routes?.map((route: any, index: number) => (
            <Polyline 
              key={index}
              positions={route.coordinates.map((p: any) => [p[1], p[0]])} // backend returns [lon, lat]
              pathOptions={{ 
                color: index === 0 ? (isNavigating ? '#10b981' : '#3b82f6') : '#475569', 
                weight: index === 0 ? (isNavigating ? 10 : 6) : 4,
                opacity: index === 0 ? 0.9 : 0.4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          ))}

          {multimodalData?.first_mile_hub && !isNavigating && (
            <Marker position={[multimodalData.first_mile_hub.latitude, multimodalData.first_mile_hub.longitude]}>
              <Popup>Nearest Transit Hub: {multimodalData.first_mile_hub.name}</Popup>
            </Marker>
          )}

          {/* Render Safety Context: Hazards and Facilities */}
          {activeRoute?.safety_context?.hazards?.map((hazard: any) => (
            <CircleMarker 
              key={hazard.id} 
              center={[hazard.latitude, hazard.longitude]} 
              radius={6} 
              color="red" 
              fillColor="red" 
              fillOpacity={0.6}
            >
              <Popup className="font-semibold text-red-600">Hazard: {hazard.description}</Popup>
            </CircleMarker>
          ))}
          {activeRoute?.safety_context?.facilities_within_corridor?.map((fac: any, idx: number) => (
            <CircleMarker 
              key={idx} 
              center={[fac.facility.latitude, fac.facility.longitude]} 
              radius={5} 
              color={fac.facility.facility_type === 'CCTV' ? 'purple' : 'blue'} 
              fillColor={fac.facility.facility_type === 'CCTV' ? 'purple' : 'blue'} 
              fillOpacity={0.6}
            >
              <Popup>
                <strong>{fac.facility.name}</strong><br/>
                Type: {fac.facility.facility_type}<br/>
                {fac.facility.phone && `Phone: ${fac.facility.phone}`}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="absolute inset-0 z-40 pointer-events-none">
        
        {/* Floating Emergency Button */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 pointer-events-auto flex flex-col gap-3 items-end">
          <button 
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full shadow-lg shadow-red-500/30 transition-all active:scale-95 font-semibold"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Emergency</span>
          </button>

          {/* Weather Context (if available) */}
          {weather && (
            <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-md border flex items-start gap-3 max-w-xs transition-all
                            ${weather.is_adverse ? 'bg-orange-50/90 border-orange-200' : 'bg-white/90 border-gray-200'}`}>
              <div className={`p-2 rounded-full ${weather.is_adverse ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {weather.weather_condition.includes('Rain') ? <CloudRain className="w-5 h-5" /> : <ThermometerSun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{weather.weather_condition} ({weather.temperature_c}°C)</h4>
                {weather.advisory_message && (
                  <p className={`text-xs ${weather.is_adverse ? 'text-orange-700' : 'text-gray-600'}`}>
                    {weather.advisory_message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Multimodal Hub Info */}
          {multimodalData?.first_mile_hub && (
             <div className="bg-white/90 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-xl max-w-xs text-sm">
               <h4 className="font-semibold mb-1">Transit Connectivity</h4>
               <p className="text-gray-600">Nearest hub: <b>{multimodalData.first_mile_hub.name}</b></p>
               <p className="text-xs text-gray-500 mt-1">{Math.round(multimodalData.first_mile_distance_meters)}m away from origin</p>
             </div>
          )}
        </div>

        <RoutingPanel 
          origin={origin} 
          dest={dest} 
          onSetMode={setSelectionMode} 
          selectionMode={selectionMode}
          onRoutesFound={setRoutesData}
          onMultimodalFound={setMultimodalData}
          activeRoute={activeRoute}
          isNavigating={isNavigating}
          onStartNavigation={() => setIsNavigating(true)}
          onExitNavigation={() => setIsNavigating(false)}
        />
      </div>

      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
        userLocation={origin}
      />
    </div>
  );
}

export default App;
