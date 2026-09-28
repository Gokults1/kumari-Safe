import React, { useRef, useState, useEffect } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox';

interface Map3DProps {
  children?: React.ReactNode;
}

const Map3D: React.FC<Map3DProps> = ({ children }) => {
  const mapRef = useRef<MapRef>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-900 text-white text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Mapbox Token Missing</h2>
          <p>Please add <code className="bg-slate-800 px-2 py-1 rounded">VITE_MAPBOX_TOKEN=your_token_here</code> to your <code className="bg-slate-800 px-2 py-1 rounded">.env</code> file.</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 77.4119,
        latitude: 8.1833,
        zoom: 15,
        pitch: 60,
        bearing: 45
      }}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100vw', height: '100vh' }}
      antialias={true}
    >
      <Source
        id="composite"
        type="vector"
        url="mapbox://mapbox.mapbox-streets-v8"
      />
      
      {/* 3D Buildings Layer */}
      <Layer
        id="3d-buildings"
        source="composite"
        source-layer="building"
        filter={['==', 'extrude', 'true']}
        type="fill-extrusion"
        minzoom={14}
        paint={{
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            14.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            14.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }}
      />
      
      {children}
    </Map>
  );
};

export default Map3D;
