import L, { LatLngExpression } from 'leaflet';
import { IMapMarker } from 'models/map';

export const DEFAULT_CENTER: LatLngExpression = [50.0755, 14.4378];
export const DEFAULT_ZOOM = 13;

export const INITIAL_MARKERS: IMapMarker[] = [
  {
    id: '0c3fab4a-c7f0-4902-810e-a695cc31d1d6',
    position: L.latLng(50.087, 14.421),
    label: 'Praha',
  },
  {
    id: 'ae6c1f7d-d378-4161-8c63-f9a0d9785917',
    position: L.latLng(49.1951, 16.6068),
    label: 'Brno',
  },
  {
    id: '2e376730-f11b-40d5-be5b-a1f6f00673a7',
    position: L.latLng(49.8209, 18.2625),
    label: 'Ostrava',
  },
];
