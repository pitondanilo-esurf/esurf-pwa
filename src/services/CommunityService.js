import apiClient from './axios';

export default {
    async create(payload) {
        return apiClient.post('/api/communities', payload);
    },

    async getMyCommunity() {
        return apiClient.get('/api/my-community');
    }
};