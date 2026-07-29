import api from "../lib/api";
import type { AxiosError } from "axios";

export interface Equipo {
  id: string | number;
  nombre: string;
  /** Logo en base64, sin el prefijo data: */
  logo: string | null;
  jugadores: number;
}

/**
 * Equipos activos con jugadores. Se pide una sola vez al montar: la pantalla
 * refresca el ranking cada 10 segundos y no conviene traer los logos en cada
 * fila de cada refresco.
 */
export const getEquipos = async (): Promise<Equipo[]> => {
  try {
    const response = await api.get("/equipos");
    return (response.data.data || []).map((equipo: any) => ({
      id: equipo.id,
      nombre: equipo.nombre,
      logo: equipo.logo || null,
      jugadores: Number(equipo.jugadores) || 0,
    }));
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw (
      axiosError.response?.data || {
        message: "Error al obtener equipos",
      }
    );
  }
};
