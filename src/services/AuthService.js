import apiClient from './axios';

export default {
    // --- AUTENTICAZIONE BASE ---
    async getCsrfCookie() {
        return apiClient.get('/sanctum/csrf-cookie');
    },

    async login(credentials) {
        await this.getCsrfCookie();
        return apiClient.post('/api/login', credentials);
    },

    async logout() {
        return apiClient.post('/api/logout');
    },

    async register(userData) {
        await this.getCsrfCookie();
        return apiClient.post('/api/register', userData);
    },

    async getUser() {
        return apiClient.get('/api/user');
    },

    // --- OTP ---
    async sendOtp(email) {
        return apiClient.post('/api/otp/send', { email });
    },

    async verifyOtp(payload) {
        return apiClient.post('/api/otp/verify', payload);
    },

    // --- PROFILO & DOCUMENTI ---
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

    // --- SEZIONE ADMIN (RBAC) ---
    async getOwners() {
        return apiClient.get('/api/admin/owners');
    },

    async createOwner(ownerData) {
        return apiClient.post('/api/admin/owners', ownerData);
    },

    async getAdminStats() {
        return apiClient.get('/api/admin/stats');
    },

    // --- SETUP OWNER (Magic Link) ---
    async completeOwnerSetup(payload, tempToken) {
        // [FIX 419] Inizializziamo il cookie CSRF prima della richiesta.
        // Anche se usiamo il Bearer token, Laravel richiede il CSRF check
        // perché Axios sta inviando i cookie di sessione (withCredentials: true).
        await this.getCsrfCookie();

        return apiClient.post('/api/auth/complete-owner-setup', payload, {
            headers: {
                'Authorization': `Bearer ${tempToken}`
            }
        });
    }
};