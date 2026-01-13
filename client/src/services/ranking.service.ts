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
  torneosCampeon?: number;
  torneosVicecampeon?: number;
  position?: number;
}

export interface CategoriaConDatos {
  categoria: number;
  sexo: string;
  cantidadJugadores: number;
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
    const data = response.data.data || [];
    // Normalizar valores numéricos
    return data.map((jugador: any) => ({
      ...jugador,
      puntos: Number(jugador.puntos) || 0,
      partidosJugados: Number(jugador.partidosJugados) || 0,
      subTorneos: Number(jugador.subTorneos) || 0,
      torneosCampeon: Number(jugador.torneosCampeon) || 0,
      torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
    }));
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener ranking global",
      }
    );
  }
};

// Obtener ranking por competencia
export const getRankingCompetencia = async (
  competenciaId: string | number,
  categoria: string = "8",
  sexo: string = "M"
): Promise<JugadorRanking[]> => {
  try {
    const response = await api.get("/rankings/competencia", {
      params: { competenciaId, categoria, sexo },
    });
    const data = response.data.data?.ranking || [];
    // Normalizar valores numéricos
    return data.map((jugador: any) => ({
      ...jugador,
      puntos: Number(jugador.puntos) || 0,
      partidosJugados: Number(jugador.partidosJugados) || 0,
      subTorneos: Number(jugador.subTorneos) || 0,
      torneosCampeon: Number(jugador.torneosCampeon) || 0,
      torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
    }));
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

// Obtener categorías que tienen datos
export const getCategoriasConDatos = async (): Promise<CategoriaConDatos[]> => {
  try {
    const response = await api.get("/rankings/categorias-con-datos");
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener categorías con datos",
      }
    );
  }
};
