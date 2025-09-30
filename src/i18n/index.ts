import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

const storedLng =
  typeof window !== 'undefined' ? localStorage.getItem('lng') : null;

i18n.use(initReactI18next).init({
  resources,
  lng: storedLng || 'fr',
  fallbackLng: 'en',
  supportedLngs: ['fr', 'en', 'de'],
  ns: ['common', 'auth', 'dashboard', 'settings', 'training'],
  defaultNS: 'common',
});
