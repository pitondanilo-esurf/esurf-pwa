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
     * [NUOVO] Aggiorna un singolo POD in staging (chiamato dalla Modale)
     */
    async updateStagingPod(id, data) {
        return apiClient.put(`/api/pods/import/${id}`, data);
    },

    /**
     * [NUOVO] Conferma i POD selezionati per la migrazione definitiva
     */
    async processSelection(ids) {
        return apiClient.post('/api/pods/process', { ids });
    },

    /**
     * [NUOVO] Cancella un POD dalla staging
     */
    async deleteStagingPod(id) {
        return apiClient.delete(`/api/pods/import/${id}`);
    },

    async downloadTemplate() {
        return apiClient.get('/api/pods/template', {
            responseType: 'blob', // Fondamentale per il download di file
        });
    }
};