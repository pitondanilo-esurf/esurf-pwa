// src/Services/eddps_service.js
import apiClient from './axios.js'; 

export const EDDPSService = {
    async getActiveChannels() {
        try {
            console.log("📡 [EDDPS] Richiesta flussi energetici in corso...");
            // Aggiungi un timestamp per evitare che il browser/router metta in cache la risposta
            // e usa un percorso che Axios forzerà come chiamata esterna tramite la sua baseURL
            const response = await apiClient.get('/api/eddps/opportunities', {
                params: { _t: Date.now() } 
            });
            
            return response.data.data;
        } catch (error) {
            console.error("❌ [EDDPS] Errore di connessione:", error);
            return [];
        }
    }
};