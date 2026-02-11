import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 

const app = createApp(App)

// FONDAMENTALE: registra il router PRIMA di montare l'app
app.use(router)

app.mount('#app')