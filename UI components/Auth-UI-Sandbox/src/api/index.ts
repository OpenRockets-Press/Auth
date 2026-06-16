import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://openrocketsauth.alwaysdata.net/api', // Pointing directly to production backend
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const sendOtp = async (email: string, type: 'parent' | 'minor') => {
    const response = await api.post('/auth/otp/send', { email, type });
    return response.data;
};

export const verifyOtp = async (email: string, otp: string, type: 'parent' | 'minor') => {
    const response = await api.post('/auth/otp/verify', { email, otp, type });
    return response.data;
};

export const registerMinorWizard = async (formData: FormData) => {
    const response = await api.post('/auth/register-minor-wizard', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
