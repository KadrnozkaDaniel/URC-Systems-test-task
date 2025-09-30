import { LatLngExpression } from 'leaflet';

export interface IMapMarker {
  id: string; // UUID
  position: LatLngExpression;
  label: string;
}

export interface IMarkerRow extends IMapMarker {
  visible: boolean;
}

export interface IIndicatorInfo {
  id: string; // UUID
  x: number;
  y: number;
  rotation: number;
  distance: string;
  label?: string;
}
