import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import { queryAsync } from "../config/db";
import { conCache } from "../lib/cache";

/** El logo se guarda como BLOB y se envía en base64. */
const logoABase64 = (logo: unknown): string | null => {
  if (!logo) return null;
  return Buffer.isBuffer(logo) ? logo.toString("base64") : String(logo);
};

export const equiposController = {
  /**
   * Equipos activos que tienen al menos un jugador asignado.
   * La pantalla lo consume una sola vez para resolver logos y armar el select,
   * en lugar de recibir el logo repetido en cada fila del ranking.
   */
  getEquipos: async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT
          e.EquipoId as id,
          e.EquipoNombre as nombre,
          e.EquipoLogo as logo,
          COUNT(c.ClienteId) as jugadores
        FROM Equipo e
        LEFT JOIN clientes c ON c.EquipoId = e.EquipoId
        WHERE e.EquipoEstado = 1
        GROUP BY e.EquipoId, e.EquipoNombre, e.EquipoLogo
        HAVING jugadores > 0
        ORDER BY e.EquipoNombre ASC
      `;

      const equipos = await conCache("equipos", async () => {
        const results = await queryAsync(query, []);
        return results.map((equipo: any) => ({
          id: equipo.id,
          nombre: equipo.nombre,
          logo: logoABase64(equipo.logo),
          jugadores: Number(equipo.jugadores) || 0,
        }));
      });

      res.json({
        success: true,
        data: equipos,
        count: equipos.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getEquipos:", error);
      throw new AppError(error.message || "Error al obtener equipos", 500);
    }
  },
};
