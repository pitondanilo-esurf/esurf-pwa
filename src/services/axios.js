import axios from 'axios';

console.log("🔧 AXIOS: Inizializzazione servizio...");

const apiClient = axios.create({
    baseURL: 'http://192.168.0.206:8000',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// --- INTERCEPTOR RICHIESTA ---
apiClient.interceptors.request.use(config => {
    // LOG DEBUG
    console.groupCollapsed(`🚀 AXIOS REQ: ${config.method.toUpperCase()} ${config.url}`);
    
    // 1. Cookie CSRF
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    if (tokenCookie) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(tokenCookie.split('=')[1]);
        console.log("✅ CSRF Cookie trovato e allegato.");
    }

    // 2. Token Bearer (LocalStorage)
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
        console.log("✅ Bearer Token trovato e allegato:", authToken.substring(0, 10) + "...");
    } else {
        console.warn("⚠️ Nessun Bearer Token nel LocalStorage!");
    }

    // 3. 🚀 FIX DEFINITIVO PER I CARICAMENTI FILE (FormData)
    if (config.data instanceof FormData) {
        // Eliminiamo la forzatura del JSON. 
        // Il browser inserirà in automatico "multipart/form-data; boundary=..."
        delete config.headers['Content-Type'];
        console.log("📄 Rilevato FormData: rimosso Content-Type per permettere l'invio del file.");
    }

    console.log("Headers finali:", config.headers);
    console.groupEnd();

    return config;
}, error => {
    console.error("❌ AXIOS REQ ERROR:", error);
    return Promise.reject(error);
});

// --- INTERCEPTOR RISPOSTA ---
apiClient.interceptors.response.use(
    response => {
        // console.log(`✅ AXIOS RES: ${response.status} ${response.config.url}`);
        return response;
    },
    error => {
        const status = error.response ? error.response.status : null;
        const url = error.config ? error.config.url : 'unknown';

        console.group(`🔥 AXIOS ERROR ${status} su ${url}`);
        console.error("Messaggio:", error.message);
        
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath.startsWith('/owner/setup');

        console.log("Pagina corrente:", currentPath);
        console.log("È pagina auth?", isAuthPage);

        if ((status === 401 || status === 419) && !isAuthPage) {
            console.warn("⛔ Sessione scaduta/invalida. Eseguo redirect al LOGIN.");
            localStorage.removeItem('auth_token'); 
            window.location.href = '/login'; 
        } else {
            console.log("ℹ️ Nessun redirect eseguito (Siamo in pagina auth o errore diverso).");
        }
        
        console.groupEnd();
        return Promise.reject(error);
    }
);

export default apiClient;