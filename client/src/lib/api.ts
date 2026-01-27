import axios from "axios";

//"https://kde-acceptance-science-titanium.trycloudflare.com/api";
//"https://nonrevokable-ramlike-catalina.ngrok-free.dev/api";
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://clinic-anthropology-gui-governing.trycloudflare.com/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
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
