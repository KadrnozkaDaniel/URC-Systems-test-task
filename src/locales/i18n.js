import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './cs.json';

const translationsJson = {
  cs: {
    translation: cs,
  },
};

i18next.use(initReactI18next).init({
  resources: translationsJson,
  fallbackLng: 'cs',
  lng: 'cs',
  interpolation: {
    escapeValue: false,
  },
});
