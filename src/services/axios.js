import axios from 'axios';

console.log("🔧 AXIOS: Inizializzazione servizio (STATELESS)...");

const apiClient = axios.create({
    baseURL: 'http://192.168.0.206:8000',
    // ❌ RIMOSSO withCredentials: true (Non usiamo più i cookie)
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// --- INTERCEPTOR RICHIESTA ---
apiClient.interceptors.request.use(config => {
    // Usa SOLO il Token Bearer salvato nel LocalStorage
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // FIX PER I CARICAMENTI FILE
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// --- INTERCEPTOR RISPOSTA ---
apiClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath.startsWith('/owner/setup');

        // Se becchi un 401 e non sei nella pagina di login, ti scollega
        if (status === 401 && !isAuthPage) {
            localStorage.removeItem('auth_token'); 
            window.location.href = '/login'; 
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;