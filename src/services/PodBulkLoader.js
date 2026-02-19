import apiClient from './axios';

export default {
    /**
     * Carica il file Excel per l'importazione massiva
     * @param {File} file - Il file .xlsx/.csv selezionato
     */
    async uploadExcel(file) {
        let formData = new FormData();
        formData.append('file', file);

        return apiClient.post('/api/pods/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Recupera la lista dei POD attualmente in area di staging
     */
    async getStagingPods() {
        return apiClient.get('/api/pods/staging');
    },

    /**
     * [NUOVO] Scarica il template Excel
     */
    async downloadTemplate() {
        return apiClient.get('/api/pods/template', { responseType: 'blob' });
    },

    /**
     * Aggiorna un singolo POD in staging
     */
    async updateStagingPod(id, data) {
        return apiClient.put(`/api/pods/import/${id}`, data);
    },

    /**
     * Conferma i POD selezionati per la migrazione definitiva
     */
    async processSelection(ids) {
        return apiClient.post('/api/pods/process', { ids });
    },

    /**
     * Cancella un POD dalla staging
     */
    async deleteStagingPod(id) {
        return apiClient.delete(`/api/pods/import/${id}`);
    }
};