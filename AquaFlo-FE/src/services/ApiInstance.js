import axios from 'axios';

const ApiInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

ApiInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

ApiInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized access, please login again.");
            localStorage.removeItem('accessToken');
            window.location.replace = "/login";
        }
        return Promise.reject(error);
    }
);

export default ApiInstance;