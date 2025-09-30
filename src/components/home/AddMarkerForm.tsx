import { Button, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { memo } from 'react';

export type AddMarkerFormValues = {
  label: string;
  lat: string;
  lng: string;
};

type IProps = {
  onSubmit: (values: AddMarkerFormValues) => void;
};

export const AddMarkerForm = memo(({ onSubmit }: IProps) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useFormContext<AddMarkerFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <div>
          <Typography variant="subtitle1" fontWeight="600">
            {t('map.addMarker')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('map.addMarkerHelp')}
          </Typography>
        </div>

        <Controller
          name="label"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label={t('markerForm.label')}
              placeholder={t('markerForm.placeholder.label')}
              autoComplete="off"
              fullWidth
              value={field.value ?? ''}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="lat"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t('markerForm.latitude')}
                placeholder="50.087"
                fullWidth
                value={field.value ?? ''}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="lng"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t('markerForm.longitude')}
                placeholder="14.421"
                fullWidth
                value={field.value ?? ''}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>

        <Stack>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {t('common.save')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
});
