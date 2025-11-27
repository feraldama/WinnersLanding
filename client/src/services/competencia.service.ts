import api from "../lib/api";
import type { AxiosError } from "axios";

export interface Competencia {
  id: string | number;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// Obtener competencias (placeholder - por ahora retorna vacío)
// Esto se puede implementar después cuando se agregue el modelo de competencias
export const getCompetencias = async (): Promise<{ data: Competencia[] }> => {
  try {
    // Por ahora retornamos un array vacío
    // En el futuro esto hará una llamada a la API cuando se implemente el modelo de competencias
    return { data: [] };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener competencias",
      }
    );
  }
};

