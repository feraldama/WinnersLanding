import axios from "axios";

// En desarrollo, usar el proxy de Vite (/api)
// En producción, usar ruta relativa (/api) que será manejada por nginx como proxy reverso
// Esto evita el problema de Mixed Content porque todas las peticiones son HTTPS
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Error al realizar la petición";

    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
