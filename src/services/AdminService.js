import apiClient from './axios';

export default {
  /**
   * Recupera la lista di tutti gli Owner (con stato pending/active).
   * Endpoint: GET /api/admin/owners
   */
  getOwners() {
    return apiClient.get('/api/admin/owners');
  },

  /**
   * Crea un nuovo Owner (Stato Pending).
   * Endpoint: POST /api/admin/owners
   * @param {Object} payload - { name, surname, email }
   */
  createOwner(payload) {
    return apiClient.post('/api/admin/owners', payload);
  },

  /**
   * Recupera le statistiche globali.
   * Endpoint: GET /api/admin/stats
   */
  getStats() {
    return apiClient.get('/api/admin/stats');
  },

  // --- GESTIONE POWER USER ---
  searchUserByEmail(email) {
    return apiClient.post('/api/admin/users/search', { email });
  },

  togglePowerUser(userId) {
    return apiClient.patch(`/api/admin/users/${userId}/toggle-power`);
  },

  getPowerUsers() {
    return apiClient.get('/api/admin/power-users');
  },

  // --- GESTIONE IMPIANTI ---
  getImpianti() {
    return apiClient.get('/api/impianti'); // Corretto da api a apiClient
  },
  
  createImpianto(payload) {
    return apiClient.post('/api/impianti', payload); // Corretto da api a apiClient
  },
  
  updateImpianto(pod_id, payload) {
    return apiClient.put(`/api/impianti/${pod_id}`, payload); // Corretto da api a apiClient
  },
  
  deleteImpianto(pod_id) {
    return apiClient.delete(`/api/pods/${pod_id}`); // Corretto da api a apiClient
  },
  
  testConnection(payload) {
    return apiClient.post('/api/impianti/test', payload); // Corretto da api a apiClient
  },

  getStoricoPod(podId, hours = 120) {
    // Passiamo le ore alla query string (?hours=120)
    return apiClient.get(`/api/pod/${podId}/storico?hours=${hours}`); 
  }
};