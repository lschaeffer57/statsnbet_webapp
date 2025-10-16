import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

const storedLng =
  typeof window !== 'undefined' ? localStorage.getItem('lng') : null;

const browserLanguage = navigator.language.split('-')[0];

const supportedLngs = ['fr', 'en', 'de'];

const defaultLng = supportedLngs.includes(browserLanguage)
  ? browserLanguage
  : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: storedLng || defaultLng,
  fallbackLng: 'en',
  supportedLngs,
  ns: ['common', 'auth', 'dashboard', 'settings', 'training'],
  defaultNS: 'common',
});
