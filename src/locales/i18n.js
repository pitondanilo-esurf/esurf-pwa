import { createI18n } from 'vue-i18n';
import it from './it.json';
import en from './en.json';

const i18n = createI18n({
  legacy: false, // Necessario per usare la Composition API (script setup)
  locale: localStorage.getItem('locale') || 'it',
  fallbackLocale: 'en',
  messages: {
    it,
    en
  }
});

export default i18n;