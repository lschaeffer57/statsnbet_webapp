import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

const storedLng = localStorage.getItem('lng');

const urlParams = new URLSearchParams(window.location.search);
const urlLng = urlParams.get('language');

const browserLanguage = navigator.language.split('-')[0];

const supportedLngs = ['fr', 'en', 'de'];

const defaultLng = supportedLngs.includes(browserLanguage)
  ? browserLanguage
  : 'en';

const initialLng =
  (urlLng && supportedLngs.includes(urlLng) ? urlLng : null) ||
  storedLng ||
  defaultLng;

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  supportedLngs,
  ns: ['common', 'auth', 'dashboard', 'settings', 'training'],
  defaultNS: 'common',
});

if (urlLng && supportedLngs.includes(urlLng)) {
  localStorage.setItem('lng', urlLng);
}
