import apiClient from './axios';

export default {
    async login(credentials) {
        return apiClient.post('/api/login', credentials);
    },

    async logout() {
        return apiClient.post('/api/logout');
    },

    async register(userData) {
        return apiClient.post('/api/register', userData);
    },

    async getUser() {
        return apiClient.get('/api/user');
    },

    async sendOtp(email) {
        return apiClient.post('/api/otp/send', { email });
    },

    async verifyOtp(payload) {
        return apiClient.post('/api/otp/verify', payload);
    },

    async saveProfile(profileData) {
        return apiClient.post('/api/profile', profileData);
    },

    async getLegalPreview(type) {
        return apiClient.get(`/api/legal/preview/${type}`);
    },

    async signGlobal(payload) {
        return apiClient.post('/api/legal/sign-global', payload);
    },

    async downloadLegalPdf(type) {
        return apiClient.get(`/api/legal/download/${type}`, {
            responseType: 'blob'
        });
    },

    async getOwners() {
        return apiClient.get('/api/admin/owners');
    },

    async createOwner(ownerData) {
        return apiClient.post('/api/admin/owners', ownerData);
    },

    async getAdminStats() {
        return apiClient.get('/api/admin/stats');
    },

    async completeOwnerSetup(payload, tempToken) {
        return apiClient.post('/api/auth/complete-owner-setup', payload, {
            headers: {
                'Authorization': `Bearer ${tempToken}`
            }
        });
    }
};