import apiClient from './axios'; // Importa la configurazione centralizzata

export default {
    // Helper opzionale
    async getCsrfCookie() {
        return apiClient.get('/sanctum/csrf-cookie');
    },

    // ============================================================
    // GESTIONE POD (Contatori)
    // ============================================================

    // LISTA
    async getPods() {
        return apiClient.get('/api/pods');
    },

    // AGGIUNGI
    async addPod(podData) {
        return apiClient.post('/api/pods', podData);
    },

    // MODIFICA
    updatePod(id, data) {
        if (data instanceof FormData) {
            return apiClient.post(`/api/pods/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return apiClient.put(`/api/pods/${id}`, data);
    },

    // ELIMINA
    async deletePod(id) {
        return apiClient.delete(`/api/pods/${id}`);
    },

    // REVOCA DELEGA
    async revokePod(id) {
        return apiClient.post(`/api/pods/${id}/revoke`, {});
    },

    // ============================================================
    // GESTIONE LEGALE & DOCUMENTI
    // ============================================================

    downloadPodDoc(podId, type) {
        return apiClient.get(`/api/legal/download-pod/${podId}/${type}`, { 
            responseType: 'blob' 
        });
    },

    async getLegalPreview(type, podCode) {
        return apiClient.get(`/api/legal/preview/${type}?pod_code=${podCode}`);
    },

    async signDelegation(data) {
        await this.getCsrfCookie(); 
        return apiClient.post('/api/legal/sign-pod', data);
    },

    // ============================================================
    // GESTIONE ASSET (Dispositivi su POD)
    // ============================================================
  
    // LISTA ASSET
    getAssets(podId) {
        // CORRETTO: Uso apiClient, non axios
        return apiClient.get(`/api/pods/${podId}/assets`);
    },

    // TIPI DI ASSET (Enum)
    getAssetTypes() {
        return apiClient.get('/api/pod-devices/types');
    },

    // CREA ASSET
    createAsset(payload) {
        return apiClient.post('/api/pod-assets', payload);
    },

    // MODIFICA ASSET (Mancava!)
    updateAsset(id, payload) {
        return apiClient.put(`/api/pod-assets/${id}`, payload);
    },

    // ELIMINA ASSET
    deleteAsset(assetId) {
        return apiClient.delete(`/api/pod-assets/${assetId}`);
    },
  extractFromBill(formData) {
    // Passiamo solo l'URL e il formData. NESSUN HEADER.
    return apiClient.post('/api/pods/extract', formData);
  },
};