import i18next from 'i18next'
import en from '../locales/en/translation.json'
import ar from '../locales/ar/translation.json'

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
    ar: {
      translation: ar,
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18next
