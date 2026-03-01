import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// Specifica il percorso completo verso i18n.js
import i18n from './locales/i18n'; 

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount('#app');