import api from "../lib/api";
import type { AxiosError } from "axios";

export interface Competencia {
  id: string | number;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// Obtener competencias
export const getCompetencias = async (options?: {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}): Promise<{ data: Competencia[] }> => {
  try {
    const response = await api.get("/competencias");
    const competencias = (response.data.data || []).map((comp: any) => ({
      id: comp.id,
      nombre: comp.nombre,
      fechaInicio: comp.fechaInicio,
      fechaFin: comp.fechaFin,
    }));

    // Ordenar si es necesario
    let sortedCompetencias = [...competencias];
    if (options?.sortBy) {
      sortedCompetencias.sort((a: any, b: any) => {
        const aValue = a[options.sortBy!];
        const bValue = b[options.sortBy!];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (options.sortOrder === "desc") {
          return aValue < bValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Limitar si es necesario
    if (options?.limit) {
      sortedCompetencias = sortedCompetencias.slice(0, options.limit);
    }

    return { data: sortedCompetencias };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener competencias",
      }
    );
  }
};
