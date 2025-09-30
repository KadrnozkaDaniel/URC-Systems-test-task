import L from 'leaflet';
import { IMapMarker } from 'models/map';

export const formatDistance = (meters: number) => {
  if (meters < 950) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatLatLng = (position: IMapMarker['position']) => {
  const { lat, lng } = L.latLng(position);
  return `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
};
