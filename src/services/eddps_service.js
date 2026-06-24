import apiClient from './axios.js'; 

export const EDDPSService = {
    async getActiveChannels() {
        // Rimuoviamo il try/catch qui dentro perché lo gestiremo nel componente Vue
        console.log("📡 [EDDPS] Richiesta flussi energetici...");
        const response = await apiClient.get('/api/eddps/opportunities', {
            params: { _t: Date.now() } 
        });
        return response.data.data;
    }
};