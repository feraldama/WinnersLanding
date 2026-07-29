import api from "../lib/api";
import type { AxiosError } from "axios";

export interface JugadorRanking {
  id: string | number;
  nombre: string;
  categoria: number;
  sexo: string;
  equipoId: string | number | null;
  equipoNombre: string | null;
  puntos: number;
  partidosJugados: number;
  ganados: number;
  perdidos: number;
  subTorneos?: number;
  torneosCampeon?: number;
  torneosVicecampeon?: number;
  /** Victorias consecutivas contando desde el último partido */
  racha: number;
  position?: number;
}

export interface CategoriaConDatos {
  categoria: number;
  sexo: string;
  cantidadJugadores: number;
}

const normalizarJugador = (jugador: any): JugadorRanking => ({
  ...jugador,
  equipoId: jugador.equipoId ?? null,
  equipoNombre: jugador.equipoNombre ?? null,
  puntos: Number(jugador.puntos) || 0,
  partidosJugados: Number(jugador.partidosJugados) || 0,
  ganados: Number(jugador.ganados) || 0,
  perdidos: Number(jugador.perdidos) || 0,
  subTorneos: Number(jugador.subTorneos) || 0,
  torneosCampeon: Number(jugador.torneosCampeon) || 0,
  torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
  racha: Number(jugador.racha) || 0,
});

// Obtener ranking global. equipoId opcional filtra por equipo.
export const getRankingGlobal = async (
  categoria: string = "8",
  sexo: string = "M",
  equipoId?: string | number | null
): Promise<JugadorRanking[]> => {
  try {
    const params: Record<string, string | number> = { categoria, sexo };
    if (equipoId) params.equipoId = equipoId;

    const response = await api.get("/rankings/global", { params });
    return (response.data.data || []).map(normalizarJugador);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener ranking global",
      }
    );
  }
};

// Obtener ranking por competencia. equipoId opcional filtra por equipo.
export const getRankingCompetencia = async (
  competenciaId: string | number,
  categoria: string = "8",
  sexo: string = "M",
  equipoId?: string | number | null
): Promise<JugadorRanking[]> => {
  try {
    const params: Record<string, string | number> = {
      competenciaId,
      categoria,
      sexo,
    };
    if (equipoId) params.equipoId = equipoId;

    const response = await api.get("/rankings/competencia", { params });
    return (response.data.data?.ranking || []).map(normalizarJugador);
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
    return (response.data.data || []).map(normalizarJugador);
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
