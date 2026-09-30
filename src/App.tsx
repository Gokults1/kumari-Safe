import { useState, useRef, useEffect } from 'react';
import Map, { Source, Layer, Marker, type MapRef } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ShieldAlert, CloudRain, ThermometerSun } from 'lucide-react';
import { EmergencyModal } from './components/EmergencyModal';
import { RoutingPanel } from './components/RoutingPanel';

function App() {
  const mapRef = useRef<MapRef>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [dest, setDest] = useState<[number, number] | null>(null);
  const [selectionMode, setSelectionMode] = useState<'ORIGIN' | 'DEST' | null>(null);
  const [routesData, setRoutesData] = useState<any>(null);
  const [multimodalData, setMultimodalData] = useState<any>(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
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

  useEffect(() => {
    let watchId: number;
    if (isNavigating) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            console.error('Error tracking location:', error);
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
      ? origin 
      : null;

  // Camera follows vehicle during navigation or jumps to origin
  useEffect(() => {
    if (mapRef.current && isNavigating && currentNavLocation) {
      mapRef.current.flyTo({
        center: [currentNavLocation[1], currentNavLocation[0]],
        zoom: 17,
        pitch: 60,
        bearing: 0,
        duration: 800
      });
    } else if (mapRef.current && !isNavigating && origin) {
      mapRef.current.flyTo({
        center: [origin[1], origin[0]],
        zoom: 14,
        pitch: 45,
        duration: 800
      });
    }
  }, [currentNavLocation, isNavigating, origin]);

  const [mapStyleUrl, setMapStyleUrl] = useState<'dark' | 'liberty'>('dark');

  const handleMapLoad = (e: any) => {
    const map = e.target;
    try {
      // 1. Safely add 3D building extrusion layer once vector source openmaptiles is ready
      if (!map.getLayer('3d-buildings') && map.getSource('openmaptiles')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': '#0ea5e9',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 20],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.75
          }
        });
      }

      // 2. Enhance dark style visibility so roads and oceans are crisp and distinct
      if (mapStyleUrl === 'dark') {
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#0f2744');
        }
        if (map.getLayer('highway_minor')) {
          map.setPaintProperty('highway_minor', 'line-color', '#334155');
        }
        if (map.getLayer('highway_major_inner')) {
          map.setPaintProperty('highway_major_inner', 'line-color', '#64748b');
        }
        if (map.getLayer('highway_major_casing')) {
          map.setPaintProperty('highway_major_casing', 'line-color', '#475569');
        }
        if (map.getLayer('landuse_residential')) {
          map.setPaintProperty('landuse_residential', 'fill-color', '#131e2d');
        }
        if (map.getLayer('landcover_wood')) {
          map.setPaintProperty('landcover_wood', 'fill-color', '#0f291e');
        }
      }
    } catch (err) {
      console.warn('Map style customization notice:', err);
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden relative font-sans text-slate-900 bg-slate-900">
      {/* 100% Free 3D MapContainer using MapLibre GL & OpenFreeMap */}
      <div className="absolute inset-0 z-0">
        <Map
          mapLib={maplibregl}
          ref={mapRef}
          initialViewState={{
            longitude: 77.4320,
            latitude: 8.1800,
            zoom: 14,
            pitch: 55,
            bearing: -15
          }}
          mapStyle={
            mapStyleUrl === 'dark' 
              ? 'https://tiles.openfreemap.org/styles/dark' 
              : 'https://tiles.openfreemap.org/styles/liberty'
          }
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          cursor="crosshair"
        >

          {/* Render Route Polylines via MapLibre Source and Layer */}
          {routesData?.routes?.map((route: any, index: number) => {
            const lineGeoJson: any = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates // [lon, lat] pairs
              }
            };

            return (
              <Source key={`route-${index}`} id={`route-source-${index}`} type="geojson" data={lineGeoJson}>
                <Layer
                  id={`route-layer-${index}`}
                  type="line"
                  layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                  }}
                  paint={{
                    'line-color': index === 0 ? (isNavigating ? '#10b981' : '#3b82f6') : '#64748b',
                    'line-width': index === 0 ? (isNavigating ? 8 : 6) : 4,
                    'line-opacity': index === 0 ? 0.95 : 0.4
                  }}
                />
              </Source>
            );
          })}

          {/* Origin Marker */}
          {origin && !isNavigating && (
            <Marker longitude={origin[1]} latitude={origin[0]} anchor="bottom">
              <div className="flex flex-col items-center">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Origin</span>
                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </Marker>
          )}

          {/* Destination Marker */}
          {dest && !isNavigating && (
            <Marker longitude={dest[1]} latitude={dest[0]} anchor="bottom">
              <div className="flex flex-col items-center">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Destination</span>
                <div className="w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </Marker>
          )}

          {/* Navigation Car / User Live Marker */}
          {isNavigating && currentNavLocation && (
            <Marker longitude={currentNavLocation[1]} latitude={currentNavLocation[0]} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg z-10" />
                <div className="absolute w-8 h-8 bg-emerald-400/40 rounded-full animate-ping" />
              </div>
            </Marker>
          )}

          {/* Multimodal Hub Info Marker */}
          {multimodalData?.first_mile_hub && !isNavigating && (
            <Marker longitude={multimodalData.first_mile_hub.longitude} latitude={multimodalData.first_mile_hub.latitude} anchor="bottom">
              <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 border border-amber-400">
                <span>Transit: {multimodalData.first_mile_hub.name}</span>
              </div>
            </Marker>
          )}

          {/* Police Stations Markers */}
          {activeRoute?.police_stations?.map((station: any, idx: number) => (
            <Marker key={`police-${idx}`} longitude={station.longitude ?? station.lng} latitude={station.latitude ?? station.lat} anchor="center">
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full border border-white shadow-sm" title="Police Station" />
            </Marker>
          ))}

          {/* CCTV Markers */}
          {activeRoute?.cctvs?.map((cctv: any, idx: number) => (
            <Marker key={`cctv-${idx}`} longitude={cctv.longitude ?? cctv.lng} latitude={cctv.latitude ?? cctv.lat} anchor="center">
              <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" title="CCTV" />
            </Marker>
          ))}

          {/* Hazards Markers */}
          {activeRoute?.hazards?.map((hazard: any, idx: number) => (
            <Marker key={`hazard-direct-${idx}`} longitude={hazard.longitude ?? hazard.lng} latitude={hazard.latitude ?? hazard.lat} anchor="center">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-white shadow-sm animate-pulse" title={`Hazard: ${hazard.description || "Hazard"}`} />
            </Marker>
          ))}

          {/* Original Backend Safety Context Markers */}
          {activeRoute?.safety_context?.hazards?.map((hazard: any) => (
            <Marker key={hazard.id} longitude={hazard.longitude} latitude={hazard.latitude} anchor="center">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-white shadow-sm animate-pulse" title={`Hazard: ${hazard.description}`} />
            </Marker>
          ))}
          {activeRoute?.safety_context?.facilities_within_corridor?.map((fac: any, idx: number) => (
            <Marker key={idx} longitude={fac.facility.longitude} latitude={fac.facility.latitude} anchor="center">
              <div className={`w-3 h-3 rounded-full border border-white shadow-sm ${fac.facility.facility_type === 'CCTV' ? 'bg-purple-500' : 'bg-blue-500'}`} title={fac.facility.name} />
            </Marker>
          ))}
        </Map>
      </div>

      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Floating Controls: 3D Style Selector & Emergency Button */}
        <div className="absolute top-6 right-6 pointer-events-auto flex flex-col gap-3 items-end z-40">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-full flex items-center shadow-xl text-xs font-semibold">
              <button
                onClick={() => setMapStyleUrl('dark')}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mapStyleUrl === 'dark' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                3D Dark
              </button>
              <button
                onClick={() => setMapStyleUrl('liberty')}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${mapStyleUrl === 'liberty' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                3D Street
              </button>
            </div>

            <button 
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full shadow-lg shadow-rose-500/30 transition-all active:scale-95 font-bold cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Emergency</span>
            </button>
          </div>

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
          onSetOrigin={setOrigin}
          onSetDest={setDest}
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
