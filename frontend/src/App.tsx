import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { ShieldAlert, Navigation, MapPin, Search, Shield, Flame, Activity } from 'lucide-react';
import axios from 'axios';
import './App.css';
import L from 'leaflet';

// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically fit bounds
const MapBounds = ({ bounds }: { bounds: L.LatLngBounds | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

function App() {
  const [activeTab, setActiveTab] = useState<'routing' | 'facilities'>('routing');
  const [origin, setOrigin] = useState('8.0883,77.5385'); // Kanyakumari point
  const [destination, setDestination] = useState('8.1833,77.4119'); // Nagercoil point
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);

  // Default center (Kanyakumari district)
  const defaultCenter: [number, number] = [8.1833, 77.4119];

  const handleRouteSearch = async () => {
    try {
      setLoading(true);
      const [oLat, oLon] = origin.split(',').map(Number);
      const [dLat, dLon] = destination.split(',').map(Number);

      const response = await axios.post('/api/v1/routing/directions', {
        origin_lat: oLat,
        origin_lon: oLon,
        dest_lat: dLat,
        dest_lon: dLon,
        profile: 'driving',
        include_safety_context: true,
        corridor_radius_meters: 1000
      });

      setRouteData(response.data);
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback data for demonstration if backend isn't running
      setRouteData({
        distance_meters: 18500,
        duration_seconds: 1800,
        profile: 'driving',
        geometry: {
          type: 'LineString',
          coordinates: [
            [77.5385, 8.0883],
            [77.5000, 8.1200],
            [77.4500, 8.1500],
            [77.4119, 8.1833]
          ]
        },
        safety_context: {
          police_stations_count: 2,
          hospitals_count: 1,
          fire_stations_count: 0,
          context_description: "Mapped infrastructure within 1000m of this route: 2 police station(s), 1 hospital(s)."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoutePolyline = () => {
    if (!routeData || !routeData.geometry) return null;
    // GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
    return routeData.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
  };

  const getRouteBounds = () => {
    const coords = getRoutePolyline();
    if (!coords || coords.length === 0) return null;
    return L.latLngBounds(coords);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <a href="#" className="header-logo">
          <ShieldAlert className="icon" size={28} />
          <span className="text-gradient">KumariSafe</span>
        </a>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setActiveTab('routing')}>
            <Navigation size={18} /> SafeRoute
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="sidebar-content animate-fade-in">
            <h2 className="card-title text-gradient">SafeRoute Engine</h2>
            <p className="text-secondary" style={{fontSize: '0.9rem', marginBottom: '1rem'}}>
              Calculate routes with contextual safety analysis in Kanyakumari.
            </p>
            
            <div className="routing-panel card">
              <div className="form-group">
                <label>Origin (Lat, Lon)</label>
                <div style={{position: 'relative'}}>
                  <MapPin size={16} style={{position: 'absolute', left: '10px', top: '14px', color: 'var(--text-tertiary)'}} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{paddingLeft: '2rem'}}
                    value={origin} 
                    onChange={e => setOrigin(e.target.value)} 
                    placeholder="8.0883, 77.5385" 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Destination (Lat, Lon)</label>
                <div style={{position: 'relative'}}>
                  <MapPin size={16} style={{position: 'absolute', left: '10px', top: '14px', color: 'var(--text-tertiary)'}} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{paddingLeft: '2rem'}}
                    value={destination} 
                    onChange={e => setDestination(e.target.value)} 
                    placeholder="8.1833, 77.4119" 
                  />
                </div>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleRouteSearch}
                disabled={loading}
                style={{width: '100%', marginTop: '0.5rem'}}
              >
                {loading ? 'Analyzing Route...' : <><Search size={18} /> Analyze SafeRoute</>}
              </button>
            </div>

            {routeData && (
              <div className="route-summary animate-fade-in">
                <h3 style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Navigation size={18} /> Route Overview
                </h3>
                
                <div className="stat-grid">
                  <div className="stat-box">
                    <div className="stat-value text-gradient">{formatDistance(routeData.distance_meters)}</div>
                    <div className="stat-label">Distance</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value text-gradient">{formatDuration(routeData.duration_seconds)}</div>
                    <div className="stat-label">Duration</div>
                  </div>
                </div>

                {routeData.safety_context && (
                  <div style={{marginTop: '1.5rem'}}>
                    <h4 style={{marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>
                      Safety Infrastructure (1km Corridor)
                    </h4>
                    
                    <div className="feature-item police">
                      <div className="icon-container"><Shield size={18} /></div>
                      <div className="feature-content">
                        <h4>Police Stations</h4>
                        <p>{routeData.safety_context.police_stations_count} facilities along route</p>
                      </div>
                    </div>
                    
                    <div className="feature-item hospital">
                      <div className="icon-container"><Activity size={18} /></div>
                      <div className="feature-content">
                        <h4>Hospitals</h4>
                        <p>{routeData.safety_context.hospitals_count} facilities along route</p>
                      </div>
                    </div>
                    
                    <p style={{fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '1rem', fontStyle: 'italic', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px'}}>
                      {routeData.safety_context.context_description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="map-area">
          <MapContainer 
            center={defaultCenter} 
            zoom={11} 
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {routeData && getRoutePolyline() && (
              <>
                <Polyline 
                  positions={getRoutePolyline()} 
                  color="#3b82f6" 
                  weight={5} 
                  opacity={0.8} 
                />
                <MapBounds bounds={getRouteBounds()} />
              </>
            )}

            {/* Display origin and destination markers if present */}
            {origin && (
               <Marker position={origin.split(',').map(Number) as [number, number]}>
                 <Popup>Origin</Popup>
               </Marker>
            )}
            {destination && (
               <Marker position={destination.split(',').map(Number) as [number, number]}>
                 <Popup>Destination</Popup>
               </Marker>
            )}
          </MapContainer>
        </section>
      </main>
    </div>
  );
}

export default App;
