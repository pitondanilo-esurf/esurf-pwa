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
  }
};