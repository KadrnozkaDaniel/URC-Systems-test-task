import { useCallback, useMemo, useState } from 'react';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DeleteOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatLatLng } from 'utils/string';
import { Maps } from 'components/common/map';
import { DEFAULT_CENTER, DEFAULT_ZOOM, INITIAL_MARKERS } from 'utils/constants';
import { IMarkerRow } from 'models/map';
import { newUuid } from 'utils/uuild';
import {
  AddMarkerForm,
  type AddMarkerFormValues,
} from '../components/home/AddMarkerForm';
import { useMarkerSchema } from 'utils/validation/useMarkerSchema';

const Wrapper = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(3),
  alignItems: 'stretch',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
    height: 'calc(100vh - 64px)',
  },
}));

const MapCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: '360px',
  borderRadius: Number(theme.shape.borderRadius) * 3,
  overflow: 'hidden',
  [theme.breakpoints.up('lg')]: {
    height: '100%',
  },
}));

const SidebarCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: Number(theme.shape.borderRadius) * 3,
  overflow: 'hidden',
  [theme.breakpoints.up('lg')]: {
    maxHeight: '100%',
  },
}));

const CardHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

const MarkersContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'visible',
  padding: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    overflowY: 'auto',
  },
}));

const FormSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const EmptyMarkersCard = styled(Paper)(({ theme }) => ({
  borderStyle: 'dashed',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.hover,
}));

const MarkerItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isVisible',
})<{
  isVisible: boolean;
}>(({ theme, isVisible }) => ({
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  opacity: isVisible ? 1 : 0.5,
}));

const MarkerInfo = styled('div')(() => ({
  flexGrow: 1,
  minWidth: 0,
}));

export const Home = () => {
  const { t } = useTranslation();
  const [markers, setMarkers] = useState<IMarkerRow[]>(() =>
    INITIAL_MARKERS.map((marker) => ({
      id: marker.id,
      position: marker.position,
      label: marker.label,
      visible: true,
    })),
  );

  const markerSchema = useMarkerSchema();

  const form = useForm<AddMarkerFormValues>({
    defaultValues: {
      label: '',
      lat: '',
      lng: '',
    },
    mode: 'onChange',
    resolver: zodResolver(markerSchema),
  });
  const { setValue, reset } = form;

  const allVisible = useMemo(
    () => markers.length > 0 && markers.every((marker) => marker.visible),
    [markers],
  );
  const allHidden = useMemo(
    () => markers.length > 0 && markers.every((marker) => !marker.visible),
    [markers],
  );

  const visibleMarkers = useMemo(
    () =>
      markers
        .filter((m) => m.visible)
        .map(({ id, ...rest }) => ({ id, ...rest })),
    [markers],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setValue('lat', lat.toFixed(6), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('lng', lng.toFixed(6), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const toggleMarkerVisibility = useCallback((id: string) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id ? { ...marker, visible: !marker.visible } : marker,
      ),
    );
  }, []);

  const handleRemoveMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  }, []);

  const showAllMarkers = useCallback(() => {
    setMarkers((prev) => prev.map((marker) => ({ ...marker, visible: true })));
  }, []);

  const hideAllMarkers = useCallback(() => {
    setMarkers((prev) => prev.map((marker) => ({ ...marker, visible: false })));
  }, []);

  const handleAddMarker = useCallback(
    (values: AddMarkerFormValues) => {
      setMarkers((prev) => [
        ...prev,
        {
          id: newUuid(),
          position: L.latLng(Number(values.lat), Number(values.lng)),
          label: values.label.trim(),
          visible: true,
        },
      ]);
      reset();
    },
    [reset],
  );

  return (
    <Wrapper>
      <MapCard elevation={4}>
        <Maps
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          markers={visibleMarkers}
          fitToMarkers
          onMapClick={handleMapClick}
        />
      </MapCard>

      <SidebarCard elevation={3}>
        <CardHeader>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography flexGrow="1" variant="h6">
                {t('map.markersList')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('common.total', { count: markers.length })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={showAllMarkers}
                disabled={markers.length === 0 || allVisible}
              >
                {t('common.showAll')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<VisibilityOff />}
                onClick={hideAllMarkers}
                disabled={markers.length === 0 || allHidden}
              >
                {t('common.hideAll')}
              </Button>
            </Stack>
          </Stack>
        </CardHeader>

        <Divider />

        <MarkersContent>
          <Stack spacing={2.5}>
            {markers.length === 0 && (
              <EmptyMarkersCard variant="outlined">
                <Typography variant="subtitle1" gutterBottom>
                  {t('map.noMarkersYet')}
                </Typography>
                <Typography variant="body2">
                  {t('map.noMarkersYetText')}
                </Typography>
              </EmptyMarkersCard>
            )}

            {markers.map((marker) => (
              <MarkerItem
                key={marker.id}
                variant="outlined"
                isVisible={marker.visible}
              >
                <MarkerInfo>
                  <Typography variant="subtitle1" fontWeight="600" noWrap>
                    {marker.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatLatLng(marker.position)}
                  </Typography>
                </MarkerInfo>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Tooltip
                    placement="top"
                    title={
                      marker.visible
                        ? t('map.tooltip.hideMarker')
                        : t('map.tooltip.showMarker')
                    }
                  >
                    <Switch
                      size="small"
                      checked={marker.visible}
                      onChange={() => toggleMarkerVisibility(marker.id)}
                    />
                  </Tooltip>
                  <Tooltip
                    placement="top"
                    title={t('map.tooltip.removeMarker')}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMarker(marker.id)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </MarkerItem>
            ))}
          </Stack>
        </MarkersContent>

        <Divider />

        <FormSection>
          <FormProvider {...form}>
            <AddMarkerForm onSubmit={handleAddMarker} />
          </FormProvider>
        </FormSection>
      </SidebarCard>
    </Wrapper>
  );
};
