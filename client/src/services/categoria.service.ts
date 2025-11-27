import api from "../lib/api";
import type { AxiosError } from "axios";

export interface Categoria {
  id: number;
  nombre: string;
  sexo: string;
  descripcion?: string;
  orden: number;
}

// Obtener todas las categorías
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get("/categorias");
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener categorías",
      }
    );
  }
};

// Obtener categoría por ID
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  try {
    const response = await api.get(`/categorias/${id}`);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener categoría",
      }
    );
  }
};

