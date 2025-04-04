const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`
    },
    QR: {
        GENERATE: `${API_BASE_URL}/qr/generate`,
        SCAN_FILE: `${API_BASE_URL}/qr/scan-file`,
        HISTORY: `${API_BASE_URL}/qr/history`,
        DELETE: (id) => `${API_BASE_URL}/qr/${id}`
    }
}; 