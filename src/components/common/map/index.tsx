import { useCallback, useEffect, useRef, useState } from 'react';
import { Chip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet';
import { IIndicatorInfo, IMapMarker } from 'models/map';
import 'leaflet/dist/leaflet.css';
import { formatDistance } from 'utils/string';
import { intersectWithRect } from 'utils/map';
import { DirectionArrow } from '../svgs/DirectionArrow';

const MapContainer = styled('div')(() => ({
  position: 'absolute',
  inset: 0,
}));

const IndicatorsLayer = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: theme.zIndex.tooltip,
}));

const IndicatorItem = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'left' && prop !== 'top' && prop !== 'rotation',
})<{
  left: number;
  top: number;
  rotation: number;
}>(({ theme, left, top, rotation }) => ({
  position: 'absolute',
  left,
  top,
  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
  transformOrigin: 'center center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const IndicatorLabelContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'rotation',
})<{ rotation: number }>(({ theme, rotation }) => ({
  transform: `rotate(${-rotation}deg)`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const DistanceChip = styled(Chip)(({ theme }) => ({
  height: 24,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  fontWeight: 600,
  pointerEvents: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
  '& .MuiChip-label': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const IndicatorLabelText = styled(Typography)(({ theme }) => ({
  padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
  borderRadius: 1.5,
  maxWidth: '200px',
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
  pointerEvents: 'none',
}));

interface IProps {
  center: LatLngExpression;
  zoom: number;
  markers: IMapMarker[];
  fitToMarkers?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

export const Maps = ({
  center,
  zoom,
  markers,
  fitToMarkers = false,
  onMapClick,
}: IProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const latestMarkersRef = useRef<IMapMarker[]>(markers);
  const onMapClickRef = useRef<IProps['onMapClick']>(onMapClick);
  const updateIndicatorsRef = useRef<() => void>(() => {});
  const [indicators, setIndicators] = useState<IIndicatorInfo[]>([]);

  onMapClickRef.current = onMapClick;

  const updateIndicators = useCallback(() => {
    const map = mapRef.current;
    if (!map) {
      setIndicators([]);
      return;
    }

    const currentMarkers = latestMarkersRef.current ?? [];
    if (!currentMarkers.length) {
      setIndicators([]);
      return;
    }

    const size = map.getSize();
    const bounds = map.getBounds();
    const centerLL = map.getCenter();
    const centerPt = map.latLngToContainerPoint(centerLL);

    const next: IIndicatorInfo[] = [];

    currentMarkers.forEach((marker) => {
      const latLng = L.latLng(marker.position);
      if (bounds.contains(latLng)) return;

      const point = map.latLngToContainerPoint(latLng);
      const intersection = intersectWithRect(
        centerPt.x,
        centerPt.y,
        point.x,
        point.y,
        size.x,
        size.y,
      );
      if (!intersection) return;

      const angleDeg =
        (Math.atan2(point.y - centerPt.y, point.x - centerPt.x) * 180) /
        Math.PI;
      const rotation = angleDeg + 90;

      const distance = formatDistance(centerLL.distanceTo(latLng));

      next.push({
        id: marker.id,
        x: intersection.x,
        y: intersection.y,
        rotation,
        distance,
        label: marker.label,
      });
    });

    setIndicators(next);
  }, []);

  const rafUpdateIndicators = useCallback(() => {
    requestAnimationFrame(() => updateIndicatorsRef.current?.());
  }, []);

  const syncView = useCallback(() => {
    const map = mapRef.current;
    if (!map || fitToMarkers) return;
    map.setView(center as L.LatLngExpression, zoom, { animate: false });
    rafUpdateIndicators();
  }, [center, zoom, fitToMarkers, rafUpdateIndicators]);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    markers.forEach((item) => {
      const marker = L.marker(item.position);
      if (item.label) {
        marker.bindPopup(`<div style="min-width:160px">${item.label}</div>`);
      }
      marker.addTo(layer);
    });

    if (fitToMarkers && markers.length > 0) {
      const bounds = L.featureGroup(
        markers.map((m) => L.marker(m.position)),
      ).getBounds();
      map.fitBounds(bounds, { padding: [24, 24] });
    }

    latestMarkersRef.current = markers;
    rafUpdateIndicators();
  }, [markers, fitToMarkers, rafUpdateIndicators]);

  const initMap = useCallback(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: center as L.LatLngExpression,
      zoom,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      detectRetina: true,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.scale({ position: 'bottomleft' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    const handleClick = (e: L.LeafletMouseEvent) =>
      onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
    const handleMoveZoomResize = () => rafUpdateIndicators();

    map.on('click', handleClick);
    map.on('move zoom resize', handleMoveZoomResize);

    rafUpdateIndicators();

    return () => {
      map.off('click', handleClick);
      map.off('move zoom resize', handleMoveZoomResize);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center, zoom, rafUpdateIndicators]);

  useEffect(() => {
    updateIndicatorsRef.current = updateIndicators;
  }, [updateIndicators]);

  useEffect(() => {
    const cleanup = initMap();
    return cleanup;
  }, [initMap]);

  useEffect(() => {
    syncView();
    syncMarkers();
  }, [syncView, syncMarkers]);

  return (
    <>
      <MapContainer ref={containerRef} />
      <IndicatorsLayer>
        {indicators.map((indicator) => (
          <IndicatorItem
            key={indicator.id}
            left={indicator.x}
            top={indicator.y}
            rotation={indicator.rotation}
          >
            <DirectionArrow />
            <IndicatorLabelContainer rotation={indicator.rotation}>
              <DistanceChip
                label={indicator.distance}
                size="small"
                color="primary"
              />
              <IndicatorLabelText variant="caption" noWrap>
                {indicator.label}
              </IndicatorLabelText>
            </IndicatorLabelContainer>
          </IndicatorItem>
        ))}
      </IndicatorsLayer>
    </>
  );
};
