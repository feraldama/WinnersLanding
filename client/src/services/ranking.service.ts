import api from "../lib/api";
import type { AxiosError } from "axios";

export interface JugadorRanking {
  id: string | number;
  nombre: string;
  categoria: number;
  sexo: string;
  puntos: number;
  partidosJugados: number;
  subTorneos?: number;
  position?: number;
}

// Obtener ranking global
export const getRankingGlobal = async (
  categoria: string = "8",
  sexo: string = "M"
): Promise<JugadorRanking[]> => {
  try {
    const response = await api.get("/rankings/global", {
      params: { categoria, sexo },
    });
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener ranking global",
      }
    );
  }
};

// Obtener ranking por competencia (placeholder para futuro)
export const getRankingCompetencia = async (
  competenciaId: string | number,
  categoria: string = "8",
  sexo: string = "M"
): Promise<JugadorRanking[]> => {
  try {
    // Por ahora usamos el ranking global, después se puede agregar la lógica de competencias
    const response = await api.get("/rankings/global", {
      params: { categoria, sexo },
    });
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener ranking de competencia",
      }
    );
  }
};

// Obtener ranking general (sin filtros)
export const getRankingGeneral = async (): Promise<JugadorRanking[]> => {
  try {
    const response = await api.get("/rankings");
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener ranking general",
      }
    );
  }
};

