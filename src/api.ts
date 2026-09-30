import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDirections = async (
  origin: [number, number],
  dest: [number, number],
  preference: 'FASTEST' | 'SAFEST' | 'BALANCED' = 'BALANCED',
  profile: 'driving' | 'walking' | 'cycling' | 'transit' = 'driving'
) => {
  const response = await api.post('/routing/directions', {
    origin_lat: origin[0],
    origin_lon: origin[1],
    dest_lat: dest[0],
    dest_lon: dest[1],
    profile: profile,
    include_safety_context: true,
    corridor_radius_meters: 500,
    preference: preference
  });
  return response.data;
};

export const getMultimodalHubs = async (
  origin: [number, number],
  dest: [number, number]
) => {
  const response = await api.get('/transit/connectivity', {
    params: {
      origin_lat: origin[0],
      origin_lon: origin[1],
      dest_lat: dest[0],
      dest_lon: dest[1]
    }
  });
  return response.data;
};

export const getEmergencyFacilities = async (lat: number, lon: number) => {
  const response = await api.get('/emergency/nearby', {
    params: { lat, lon, radius_meters: 5000 }
  });
  return response.data;
};

export const getEmergencyAssist = async (lat: number, lon: number) => {
  const response = await api.get('/emergency/assist', {
    params: { lat, lon }
  });
  return response.data;
};

export const searchTrains = async (destination?: string, direction?: string, station?: string) => {
  const params: any = {};
  if (destination) params.destination = destination;
  if (direction && direction !== 'ALL') params.direction = direction;
  if (station && station !== 'ALL') params.station = station;
  const response = await api.get('/transit/trains/search', { params });
  return response.data;
};

export const getAllTrains = async (direction?: string, station?: string) => {
  const params: any = {};
  if (direction && direction !== 'ALL') params.direction = direction;
  if (station && station !== 'ALL') params.station = station;
  const response = await api.get('/transit/trains/all', { params });
  return response.data;
};
