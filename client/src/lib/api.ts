import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://181.123.61.216:3011/api";

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
