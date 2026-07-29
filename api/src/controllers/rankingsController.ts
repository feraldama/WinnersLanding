import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import { queryAsync } from "../config/db";
import {
  subqueryPartidos,
  subqueryTorneos,
  subqueryTorneosPorRol,
  calcularRachas,
  limpiarNombre,
  ORDEN_RANKING,
} from "../lib/ranking";
import { conCache } from "../lib/cache";

/**
 * Ranking de jugadores. `fechas` filtra los partidos/torneos por rango
 * (competencia); `equipo` agrega el filtro por equipo.
 *
 * Orden de los parámetros:
 *   [fechas?] partidos → [categoria, fechas?] torneos →
 *   [categoria, fechas?] campeones → [categoria, fechas?] vicecampeones →
 *   categoria, sexo → [equipoId?]
 */
const queryRankingJugadores = ({
  fechas = false,
  equipo = false,
}: {
  fechas?: boolean;
  equipo?: boolean;
}) => `
  SELECT
    c.ClienteId as id,
    c.ClienteNombre as nombre,
    c.ClienteCategoria as categoria,
    c.ClienteSexo as sexo,
    c.EquipoId as equipoId,
    e.EquipoNombre as equipoNombre,
    (
      COALESCE(puntos_partidos.puntos, 0) +
      COALESCE(puntos_torneos.puntos, 0)
    ) as puntos,
    COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
    COALESCE(puntos_partidos.ganados, 0) as ganados,
    COALESCE(puntos_partidos.perdidos, 0) as perdidos,
    COALESCE(puntos_torneos.subTorneos, 0) as subTorneos,
    COALESCE(campeones.cantidad, 0) as torneosCampeon,
    COALESCE(vicecampeones.cantidad, 0) as torneosVicecampeon
  FROM clientes c
  LEFT JOIN Equipo e ON c.EquipoId = e.EquipoId
  LEFT JOIN (${subqueryPartidos({
    fechas,
  })}) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
  LEFT JOIN (${subqueryTorneos({
    fechas,
    categoria: true,
  })}) puntos_torneos ON c.ClienteId = puntos_torneos.ClienteId
  LEFT JOIN (${subqueryTorneosPorRol("C", {
    fechas,
    categoria: true,
  })}) campeones ON c.ClienteId = campeones.ClienteId
  LEFT JOIN (${subqueryTorneosPorRol("V", {
    fechas,
    categoria: true,
  })}) vicecampeones ON c.ClienteId = vicecampeones.ClienteId
  WHERE c.ClienteCategoria = ? AND c.ClienteSexo = ?
    ${equipo ? "AND c.EquipoId = ?" : ""}
    AND (puntos_partidos.partidosJugados > 0 OR puntos_torneos.subTorneos > 0)
  ${ORDEN_RANKING}
`;

/** Arma los parámetros en el orden en que aparecen los ? de queryRankingJugadores */
const armarParametros = (
  categoria: string,
  sexo: string,
  equipoId?: number | null,
  fechaInicio?: any,
  fechaFin?: any
) => {
  const fechas = Boolean(fechaInicio && fechaFin);
  const params: any[] = [];
  if (fechas) params.push(fechaInicio, fechaFin); // partidos
  params.push(categoria); // torneos
  if (fechas) params.push(fechaInicio, fechaFin);
  params.push(categoria); // campeones
  if (fechas) params.push(fechaInicio, fechaFin);
  params.push(categoria); // vicecampeones
  if (fechas) params.push(fechaInicio, fechaFin);
  params.push(categoria, sexo); // clientes
  if (equipoId) params.push(equipoId);
  return params;
};

/** Normaliza una fila del ranking y le agrega posición y racha */
const mapearJugador = (
  jugador: any,
  index: number,
  categoriaFallback: string,
  rachas: Map<string, number>
) => ({
  id: jugador.id,
  nombre: limpiarNombre(jugador.nombre),
  categoria: parseInt(jugador.categoria) || parseInt(categoriaFallback) || 0,
  sexo: jugador.sexo,
  equipoId: jugador.equipoId ?? null,
  equipoNombre: jugador.equipoNombre ?? null,
  puntos: Number(jugador.puntos) || 0,
  partidosJugados: Number(jugador.partidosJugados) || 0,
  ganados: Number(jugador.ganados) || 0,
  perdidos: Number(jugador.perdidos) || 0,
  subTorneos: Number(jugador.subTorneos) || 0,
  torneosCampeon: Number(jugador.torneosCampeon) || 0,
  torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
  racha: rachas.get(String(jugador.id)) || 0,
  position: index + 1,
});

/** equipoId del query string: número válido o null */
const parsearEquipoId = (valor: unknown): number | null => {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null;
  }
  const n = parseInt(String(valor));
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const rankingsController = {
  // Ranking global con filtros de categoría, sexo y (opcional) equipo
  getRankingGlobal: async (req: Request, res: Response) => {
    try {
      const { categoria = "8", sexo = "M" } = req.query;
      const categoriaStr = categoria.toString();
      const sexoStr = sexo.toString().toUpperCase();
      const equipoId = parsearEquipoId(req.query.equipoId);

      const ranking = await conCache(
        `global:${categoriaStr}:${sexoStr}:${equipoId ?? ""}`,
        async () => {
          const results = await queryAsync(
            queryRankingJugadores({ equipo: Boolean(equipoId) }),
            armarParametros(categoriaStr, sexoStr, equipoId)
          );

          // Sin filtro de equipo se mantiene el 404: la pantalla lo usa para
          // saltar a la siguiente categoría de la rotación. Con filtro, vacío es
          // un resultado válido (ese equipo no juega en esa categoría).
          if (results.length === 0 && !equipoId) {
            throw new AppError(
              `No hay datos disponibles para la categoría ${categoriaStr} y sexo ${sexoStr}`,
              404
            );
          }

          const rachas = await calcularRachas(results.map((r: any) => r.id));
          return results.map((jugador: any, index: number) =>
            mapearJugador(jugador, index, categoriaStr, rachas)
          );
        }
      );

      res.json({
        success: true,
        data: ranking,
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getRankingGlobal:", error);
      throw new AppError(
        error.message || "Error al obtener ranking global",
        error.statusCode || 500
      );
    }
  },

  // Ranking por competencia con filtros de categoría, sexo y (opcional) equipo
  getRankingCompetencia: async (req: Request, res: Response) => {
    try {
      const { competenciaId, categoria = "8", sexo = "M" } = req.query;
      const competenciaIdNum = parseInt(competenciaId as string);
      const categoriaStr = categoria.toString();
      const sexoStr = sexo.toString().toUpperCase();
      const equipoId = parsearEquipoId(req.query.equipoId);

      if (!competenciaId || isNaN(competenciaIdNum)) {
        throw new AppError("ID de competencia requerido", 400);
      }

      const competenciaResults = await queryAsync(
        `SELECT CompetenciaFechaInicio, CompetenciaFechaFin, CompetenciaNombre
         FROM Competencia
         WHERE CompetenciaId = ?`,
        [competenciaIdNum]
      );

      if (competenciaResults.length === 0) {
        throw new AppError("Competencia no encontrada", 404);
      }

      const { CompetenciaFechaInicio, CompetenciaFechaFin, CompetenciaNombre } =
        competenciaResults[0];

      const ranking = await conCache(
        `competencia:${competenciaIdNum}:${categoriaStr}:${sexoStr}:${
          equipoId ?? ""
        }`,
        async () => {
          const results = await queryAsync(
            queryRankingJugadores({ fechas: true, equipo: Boolean(equipoId) }),
            armarParametros(
              categoriaStr,
              sexoStr,
              equipoId,
              CompetenciaFechaInicio,
              CompetenciaFechaFin
            )
          );

          const rachas = await calcularRachas(
            results.map((r: any) => r.id),
            CompetenciaFechaInicio,
            CompetenciaFechaFin
          );
          return results.map((jugador: any, index: number) =>
            mapearJugador(jugador, index, categoriaStr, rachas)
          );
        }
      );

      res.json({
        success: true,
        data: {
          competencia: {
            id: competenciaIdNum,
            nombre: CompetenciaNombre,
            fechaInicio: CompetenciaFechaInicio,
            fechaFin: CompetenciaFechaFin,
          },
          ranking,
        },
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getRankingCompetencia:", error);
      throw new AppError(
        error.message || "Error al obtener ranking de competencia",
        error.statusCode || 500
      );
    }
  },

  // Ranking general sin filtros de categoría/sexo
  getRankingGeneral: async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          c.EquipoId as equipoId,
          e.EquipoNombre as equipoNombre,
          (
            COALESCE(puntos_partidos.puntos, 0) +
            COALESCE(puntos_torneos.puntos, 0)
          ) as puntos,
          COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
          COALESCE(puntos_partidos.ganados, 0) as ganados,
          COALESCE(puntos_partidos.perdidos, 0) as perdidos,
          COALESCE(puntos_torneos.subTorneos, 0) as subTorneos,
          COALESCE(campeones.cantidad, 0) as torneosCampeon,
          COALESCE(vicecampeones.cantidad, 0) as torneosVicecampeon
        FROM clientes c
        LEFT JOIN Equipo e ON c.EquipoId = e.EquipoId
        LEFT JOIN (${subqueryPartidos()}) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
        LEFT JOIN (${subqueryTorneos()}) puntos_torneos ON c.ClienteId = puntos_torneos.ClienteId
        LEFT JOIN (${subqueryTorneosPorRol(
          "C"
        )}) campeones ON c.ClienteId = campeones.ClienteId
        LEFT JOIN (${subqueryTorneosPorRol(
          "V"
        )}) vicecampeones ON c.ClienteId = vicecampeones.ClienteId
        WHERE (puntos_partidos.partidosJugados > 0 OR puntos_torneos.subTorneos > 0)
        ${ORDEN_RANKING}
      `;

      const results = await queryAsync(query, []);
      const rachas = await calcularRachas(results.map((r: any) => r.id));
      const ranking = results.map((jugador: any, index: number) =>
        mapearJugador(jugador, index, "0", rachas)
      );

      res.json({
        success: true,
        data: ranking,
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getRankingGeneral:", error);
      throw new AppError(
        error.message || "Error al obtener ranking general",
        500
      );
    }
  },

  getRankingByCategoria: async (req: Request, res: Response) => {
    try {
      const { categoria = "8", sexo = "M" } = req.query;
      const categoriaStr = categoria.toString();
      const sexoStr = sexo.toString().toUpperCase();

      const results = await queryAsync(
        queryRankingJugadores({}),
        armarParametros(categoriaStr, sexoStr)
      );

      const rachas = await calcularRachas(results.map((r: any) => r.id));
      const ranking = results.map((jugador: any, index: number) =>
        mapearJugador(jugador, index, categoriaStr, rachas)
      );

      res.json({
        success: true,
        data: {
          categoria: {
            nombre: categoriaStr,
            sexo: sexoStr,
          },
          ranking,
        },
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getRankingByCategoria:", error);
      throw new AppError(
        error.message || "Error al obtener ranking por categoría",
        error.statusCode || 500
      );
    }
  },

  getTopJugadores: async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.params.limit) || 10;

      if (isNaN(limit) || limit < 1) {
        throw new AppError("Límite inválido");
      }

      const query = `
        SELECT
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          c.EquipoId as equipoId,
          e.EquipoNombre as equipoNombre,
          COALESCE(puntos_partidos.puntos, 0) as puntos,
          COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
          COALESCE(puntos_partidos.ganados, 0) as ganados,
          COALESCE(puntos_partidos.perdidos, 0) as perdidos
        FROM clientes c
        LEFT JOIN Equipo e ON c.EquipoId = e.EquipoId
        INNER JOIN (${subqueryPartidos()}) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
        WHERE puntos_partidos.partidosJugados > 0
        ${ORDEN_RANKING}
        LIMIT ?
      `;

      const results = await queryAsync(query, [limit]);
      const rachas = await calcularRachas(results.map((r: any) => r.id));
      const ranking = results.map((jugador: any, index: number) =>
        mapearJugador(jugador, index, "0", rachas)
      );

      res.json({
        success: true,
        data: ranking,
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getTopJugadores:", error);
      throw new AppError(
        error.message || "Error al obtener top jugadores",
        error.statusCode || 500
      );
    }
  },

  // Obtener categorías que tienen datos (jugadores con partidos)
  getCategoriasConDatos: async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          COUNT(DISTINCT c.ClienteId) as cantidadJugadores
        FROM clientes c
        INNER JOIN PartidoJugador pj ON c.ClienteId = pj.ClienteId
        INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
        WHERE pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != ''
        GROUP BY c.ClienteCategoria, c.ClienteSexo
        ORDER BY c.ClienteCategoria DESC, c.ClienteSexo ASC
      `;

      const results = await queryAsync(query, []);

      const categorias = results.map((item: any) => ({
        categoria: parseInt(item.categoria) || 0,
        sexo: item.sexo,
        cantidadJugadores: Number(item.cantidadJugadores) || 0,
      }));

      res.json({
        success: true,
        data: categorias,
        count: categorias.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getCategoriasConDatos:", error);
      throw new AppError(
        error.message || "Error al obtener categorías con datos",
        500
      );
    }
  },
};
