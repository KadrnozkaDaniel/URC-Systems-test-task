import { useTranslation } from 'react-i18next';
import z from 'zod';

export const useMarkerSchema = () => {
  const { t } = useTranslation();

  return z.object({
    label: z.string().trim().min(1, t('markerForm.validation.labelRequired')),
    lat: z
      .string()
      .trim()
      .nonempty(t('markerForm.validation.latRequired'))
      .refine(
        (value) => !Number.isNaN(Number(value)),
        t('markerForm.validation.latInvalid'),
      )
      .refine((value) => {
        const numericValue = Number(value);

        return numericValue >= -90 && numericValue <= 90;
      }, t('markerForm.validation.latRange')),
    lng: z
      .string()
      .trim()
      .nonempty(t('markerForm.validation.lngRequired'))
      .refine(
        (value) => !Number.isNaN(Number(value)),
        t('markerForm.validation.lngInvalid'),
      )
      .refine((value) => {
        const numericValue = Number(value);

        return numericValue >= -180 && numericValue <= 180;
      }, t('markerForm.validation.lngRange')),
  });
};
