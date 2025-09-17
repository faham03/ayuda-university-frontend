// src/services/axios.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

// Crée une instance axios
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter automatiquement le token access
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer l'expiration du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 Unauthorized → essayons de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          throw new Error("No refresh token available");
        }

        // Demande un nouveau access token
        const res = await axios.post(`${API_URL}token/refresh/`, {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

    
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Échec du refresh token:", err);
        
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
