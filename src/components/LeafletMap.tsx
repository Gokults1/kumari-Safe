import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { getAccuratePosition } from '../geo';

interface LeafletMapProps {
  origin: [number, number] | null;
  dest: [number, number] | null;
  userLocation: [number, number] | null;
  userHeading?: number;
  routes: any[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (idx: number) => void;
  isNavigating: boolean;
  onMapClick: (lat: number, lng: number) => void;
  policeStations?: any[];
  cctvs?: any[];
  hazards?: any[];
  onLocateUser?: (coords: [number, number]) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  origin,
  dest,
  userLocation,
  userHeading = 0,
  routes = [],
  selectedRouteIndex = 0,
  onSelectRouteIndex,
  isNavigating,
  onMapClick,
  policeStations = [],
  cctvs = [],
  hazards = [],
  onLocateUser
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylinesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevOriginRef = useRef<[number, number] | null>(null);
  const prevDestRef = useRef<[number, number] | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on userLocation if available, else Nagercoil center
    const initialCenter: [number, number] = userLocation || origin || [8.1833, 77.4119];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // 100% Free Public OpenStreetMap Raster Tiles - ZERO API KEY REQUIRED
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer groups for clean updates
    polylinesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Polylines when routes or selectedRouteIndex changes
  useEffect(() => {
    const map = mapRef.current;
    const group = polylinesLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!routes || routes.length === 0) return;

    const allBounds: L.LatLngExpression[] = [];

    routes.forEach((route, idx) => {
      const isSelected = idx === selectedRouteIndex;
      // Coordinates in route are [lon, lat] pairs from GeoJSON
      const latLngs: L.LatLngExpression[] = (route.coordinates || []).map((c: [number, number]) => [c[1], c[0]]);

      if (latLngs.length === 0) return;

      if (isSelected) {
        allBounds.push(...latLngs);
      }

      // Outer glow for active route
      if (isSelected) {
        const glow = L.polyline(latLngs, {
          color: isNavigating ? '#10b981' : '#3b82f6',
          weight: 9,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        });
        group.addLayer(glow);
      }

      // Main line
      const polyline = L.polyline(latLngs, {
        color: isSelected 
          ? (isNavigating ? '#10b981' : '#2563eb') 
          : '#94a3b8',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.6,
        dashArray: isSelected ? undefined : '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Click to select route
      polyline.on('click', () => {
        onSelectRouteIndex(idx);
      });

      polyline.bindTooltip(
        `${route.label || `Route ${idx + 1}`} • ${route.distance_km} km (${Math.round(route.duration_minutes)} min)`,
        { sticky: true, className: 'font-sans font-bold text-xs shadow-md' }
      );

      group.addLayer(polyline);
    });

    // Auto-fit bounds if not currently navigating
    if (!isNavigating && allBounds.length > 0) {
      map.fitBounds(L.latLngBounds(allBounds), {
        padding: [60, 60],
        maxZoom: 15
      });
    }
  }, [routes, selectedRouteIndex, isNavigating, onSelectRouteIndex]);

  // Smooth Camera Management: automatically frames Origin, Destination, or both
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isNavigating) return;

    // When routes are displayed, route framing takes precedence
    if (routes && routes.length > 0) return;

    const originChanged = origin && (!prevOriginRef.current || prevOriginRef.current[0] !== origin[0] || prevOriginRef.current[1] !== origin[1]);
    const destChanged = dest && (!prevDestRef.current || prevDestRef.current[0] !== dest[0] || prevDestRef.current[1] !== dest[1]);

    prevOriginRef.current = origin;
    prevDestRef.current = dest;

    // Both origin and destination are set -> frame both in view
    if (origin && dest) {
      const bounds = L.latLngBounds([
        [origin[0], origin[1]],
        [dest[0], dest[1]]
      ]);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 15,
        animate: true
      });
      return;
    }

    // Origin set or changed (e.g. user clicked "Use My Current Location") -> fly straight to origin!
    if (origin && originChanged && !dest) {
      map.flyTo([origin[0], origin[1]], 16, {
        animate: true,
        duration: 1.0
      });
      return;
    }

    // Destination set or changed alone -> fly to destination!
    if (dest && destChanged && !origin) {
      map.flyTo([dest[0], dest[1]], 16, {
        animate: true,
        duration: 1.0
      });
      return;
    }
  }, [origin, dest, routes, isNavigating]);

  // Pan to userLocation on initial load if no origin or destination has been set
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isNavigating || origin || dest || (routes && routes.length > 0)) return;
    if (userLocation) {
      map.panTo([userLocation[0], userLocation[1]], { animate: true });
    }
  }, [userLocation]);

  // Update Origin and Destination Markers
  useEffect(() => {
    const group = markersLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    // Origin Marker (Blue Pin with "Origin" badge)
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-origin-icon',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
            <span style="background:#2563eb; color:white; font-size:11px; font-weight:800; padding:2px 7px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.35); white-space:nowrap;">📍 Origin</span>
            <div style="width:16px; height:16px; background:#2563eb; border:3px solid white; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.4); margin-top:2px;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      group.addLayer(
        L.marker([origin[0], origin[1]], { icon: originIcon })
          .bindPopup(`<b>Starting Point (Origin)</b><br/>${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}`)
      );
    }

    // Destination Marker (Rose Pin with "Destination" badge)
    if (dest) {
      const destIcon = L.divIcon({
        className: 'custom-dest-icon',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
            <span style="background:#e11d48; color:white; font-size:11px; font-weight:800; padding:2px 7px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.35); white-space:nowrap;">🏁 Destination</span>
            <div style="width:16px; height:16px; background:#e11d48; border:3px solid white; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.4); margin-top:2px;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      group.addLayer(
        L.marker([dest[0], dest[1]], { icon: destIcon })
          .bindPopup(`<b>Destination</b><br/>${dest[0].toFixed(5)}, ${dest[1].toFixed(5)}`)
      );
    }

    // Police Stations
    policeStations.forEach((ps) => {
      const lat = ps.latitude ?? ps.lat;
      const lon = ps.longitude ?? ps.lng;
      if (lat && lon) {
        const icon = L.divIcon({
          className: 'police-marker',
          html: `<div style="width:12px; height:12px; background:#3b82f6; border:2px solid white; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);" title="Police Station"></div>`,
          iconSize: [12, 12]
        });
        group.addLayer(L.marker([lat, lon], { icon }).bindPopup(`<b>${ps.name || 'Police Station'}</b>`));
      }
    });

    // CCTVs
    cctvs.forEach((c) => {
      const lat = c.latitude ?? c.lat;
      const lon = c.longitude ?? c.lng;
      if (lat && lon) {
        const icon = L.divIcon({
          className: 'cctv-marker',
          html: `<div style="width:10px; height:10px; background:#a855f7; border:2px solid white; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);" title="CCTV Camera"></div>`,
          iconSize: [10, 10]
        });
        group.addLayer(L.marker([lat, lon], { icon }));
      }
    });

    // Hazards
    hazards.forEach((h) => {
      const lat = h.latitude ?? h.lat;
      const lon = h.longitude ?? h.lng;
      if (lat && lon) {
        const icon = L.divIcon({
          className: 'hazard-marker',
          html: `<div style="width:12px; height:12px; background:#ef4444; border:2px solid white; border-radius:50%; box-shadow:0 0 8px #ef4444;" title="Hazard"></div>`,
          iconSize: [12, 12]
        });
        group.addLayer(L.marker([lat, lon], { icon }).bindPopup(`<b>Hazard: ${h.description || 'Road Hazard'}</b>`));
      }
    });
  }, [origin, dest, policeStations, cctvs, hazards]);

  // Live Vehicle / User Location Marker with Animated Heading Arrow
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    const vehicleIcon = L.divIcon({
      className: 'live-vehicle-icon',
      html: `
        <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; transform:translate(-50%, -50%);">
          <!-- Pulse wave ring -->
          <div style="position:absolute; width:36px; height:36px; background:rgba(16,185,129,0.3); border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <!-- Outer circle -->
          <div style="position:absolute; width:22px; height:22px; background:#10b981; border:3px solid white; border-radius:50%; box-shadow:0 2px 10px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; transform:rotate(${userHeading}deg);">
            <!-- Arrow tip pointing in heading direction -->
            <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:7px solid white; transform:translateY(-1px);"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation[0], userLocation[1]]);
      userMarkerRef.current.setIcon(vehicleIcon);
    } else {
      userMarkerRef.current = L.marker([userLocation[0], userLocation[1]], { icon: vehicleIcon }).addTo(map);
    }

    // Camera follows vehicle during active navigation
    if (isNavigating) {
      map.panTo([userLocation[0], userLocation[1]], { animate: true, duration: 0.5 });
      if (map.getZoom() < 16) {
        map.setZoom(17);
      }
    }
  }, [userLocation, userHeading, isNavigating]);

  // Floating "Locate Me" button handler
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const pos = await getAccuratePosition(8000);
      const coords: [number, number] = [pos.latitude, pos.longitude];
      if (onLocateUser) {
        onLocateUser(coords);
      }
      const map = mapRef.current;
      if (map) {
        map.flyTo(coords, 17, { animate: true, duration: 1.0 });
      }
      const acc = Math.round(pos.accuracy || 10);
      setToastMessage(`📍 GPS Locked (±${acc}m accuracy)`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Locate me failed:', err);
      setToastMessage('⚠️ Could not get GPS location');
      setTimeout(() => setToastMessage(null), 3500);
    }
    setIsLocating(false);
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0 z-0 bg-slate-100" 
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating GPS Recenter Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute bottom-20 right-3.5 z-30 bg-white/95 hover:bg-white text-slate-800 p-3 rounded-full shadow-2xl border border-slate-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer hover:border-blue-400 focus:outline-none"
        title="Center on My Real-time Location"
      >
        <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
      </button>

      {/* GPS Accuracy Toast Message */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-xs font-bold px-4 py-2 rounded-full shadow-xl animate-fade-in pointer-events-none flex items-center gap-1.5">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
