import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import { queryAsync } from "../config/db";

export const rankingsController = {
  // Ranking global con filtros de categoría y sexo
  getRankingGlobal: async (req: Request, res: Response) => {
    try {
      const { categoria = "8", sexo = "M" } = req.query;
      const categoriaStr = categoria.toString();
      const sexoStr = sexo.toString().toUpperCase();

      console.log("🔍 Buscando ranking global con:", {
        categoria: categoriaStr,
        sexo: sexoStr,
      });

      // Query SQL directo con puntos de partidos y torneos (campeón/vicecampeón)
      const query = `
        SELECT 
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          (
            COALESCE(puntos_partidos.puntos, 0) +
            COALESCE(puntos_torneos.puntos, 0)
          ) as puntos,
          COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
          COALESCE(puntos_torneos.subTorneos, 0) as subTorneos,
          COALESCE(campeones.torneosCampeon, 0) as torneosCampeon,
          COALESCE(vicecampeones.torneosVicecampeon, 0) as torneosVicecampeon
        FROM clientes c
        LEFT JOIN (
          SELECT 
            pj.ClienteId,
            SUM(CASE 
              WHEN pj.PartidoJugadorResultado = 'G' THEN 100 
              WHEN pj.PartidoJugadorResultado = 'P' THEN 30 
              ELSE 0 
            END) as puntos,
            COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados
          FROM PartidoJugador pj
          INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
          GROUP BY pj.ClienteId
        ) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            SUM(CASE 
              WHEN tj.TorneoJugadorRol = 'C' THEN 1000
              WHEN tj.TorneoJugadorRol = 'V' THEN 500
              ELSE 0
            END) as puntos,
            COUNT(DISTINCT tj.TorneoId) as subTorneos
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ?
          GROUP BY tj.ClienteId
        ) puntos_torneos ON c.ClienteId = puntos_torneos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosCampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ? AND tj.TorneoJugadorRol = 'C'
          GROUP BY tj.ClienteId
        ) campeones ON c.ClienteId = campeones.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosVicecampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ? AND tj.TorneoJugadorRol = 'V'
          GROUP BY tj.ClienteId
        ) vicecampeones ON c.ClienteId = vicecampeones.ClienteId
        WHERE c.ClienteCategoria = ? AND c.ClienteSexo = ?
          AND (puntos_partidos.partidosJugados > 0 OR puntos_torneos.subTorneos > 0)
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(query, [
        categoriaStr,
        categoriaStr,
        categoriaStr,
        categoriaStr,
        sexoStr,
      ]);

      // Si no hay datos, devolver error 404
      if (results.length === 0) {
        throw new AppError(
          `No hay datos disponibles para la categoría ${categoriaStr} y sexo ${sexoStr}`,
          404
        );
      }

      // Agregar posición y limpiar nombre (remover "00" al final si existe)
      const ranking = results.map((jugador: any, index: number) => {
        let nombreLimpio = (jugador.nombre || "").trim();
        // Remover "00" al final del nombre si existe
        if (nombreLimpio.endsWith("00")) {
          nombreLimpio = nombreLimpio.slice(0, -2).trim();
        }
        return {
          id: jugador.id,
          nombre: nombreLimpio,
          categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
          sexo: jugador.sexo,
          puntos: Number(jugador.puntos) || 0,
          partidosJugados: Number(jugador.partidosJugados) || 0,
          subTorneos: Number(jugador.subTorneos) || 0,
          torneosCampeon: Number(jugador.torneosCampeon) || 0,
          torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
          position: index + 1,
        };
      });

      console.log(`📊 Ranking obtenido: ${ranking.length} jugadores`);

      res.json({
        success: true,
        data: ranking,
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getRankingGlobal:", error);
      console.error("Stack trace:", error.stack);
      throw new AppError(
        error.message || "Error al obtener ranking global",
        error.statusCode || 500
      );
    }
  },

  getRankingGeneral: async (req: Request, res: Response) => {
    try {
      // Query SQL directo para obtener todos los jugadores activos con puntos de partidos y torneos
      const query = `
        SELECT 
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          (
            COALESCE(puntos_partidos.puntos, 0) +
            COALESCE(puntos_torneos.puntos, 0)
          ) as puntos,
          COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
          COALESCE(puntos_torneos.subTorneos, 0) as subTorneos,
          COALESCE(campeones.torneosCampeon, 0) as torneosCampeon,
          COALESCE(vicecampeones.torneosVicecampeon, 0) as torneosVicecampeon
        FROM clientes c
        LEFT JOIN (
          SELECT 
            pj.ClienteId,
            SUM(CASE 
              WHEN pj.PartidoJugadorResultado = 'G' THEN 100 
              WHEN pj.PartidoJugadorResultado = 'P' THEN 30 
              ELSE 0 
            END) as puntos,
            COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados
          FROM PartidoJugador pj
          INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
          GROUP BY pj.ClienteId
        ) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            SUM(CASE 
              WHEN tj.TorneoJugadorRol = 'C' THEN 1000
              WHEN tj.TorneoJugadorRol = 'V' THEN 500
              ELSE 0
            END) as puntos,
            COUNT(DISTINCT tj.TorneoId) as subTorneos
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          GROUP BY tj.ClienteId
        ) puntos_torneos ON c.ClienteId = puntos_torneos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosCampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE tj.TorneoJugadorRol = 'C'
          GROUP BY tj.ClienteId
        ) campeones ON c.ClienteId = campeones.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosVicecampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE tj.TorneoJugadorRol = 'V'
          GROUP BY tj.ClienteId
        ) vicecampeones ON c.ClienteId = vicecampeones.ClienteId
        WHERE (puntos_partidos.partidosJugados > 0 OR puntos_torneos.subTorneos > 0)
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(query, []);

      const ranking = results.map((jugador: any, index: number) => {
        let nombreLimpio = (jugador.nombre || "").trim();
        // Remover "00" al final del nombre si existe
        if (nombreLimpio.endsWith("00")) {
          nombreLimpio = nombreLimpio.slice(0, -2).trim();
        }
        return {
          id: jugador.id,
          nombre: nombreLimpio,
          categoria: parseInt(jugador.categoria) || 0,
          sexo: jugador.sexo,
          puntos: Number(jugador.puntos) || 0,
          partidosJugados: Number(jugador.partidosJugados) || 0,
          subTorneos: Number(jugador.subTorneos) || 0,
          torneosCampeon: Number(jugador.torneosCampeon) || 0,
          torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
          position: index + 1,
        };
      });

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

      const query = `
        SELECT 
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          SUM(CASE 
            WHEN pj.PartidoJugadorResultado = 'G' THEN 100 
            WHEN pj.PartidoJugadorResultado = 'P' THEN 30 
            ELSE 0 
          END) as puntos,
          COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados
        FROM clientes c
        INNER JOIN PartidoJugador pj ON c.ClienteId = pj.ClienteId
        INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
        WHERE c.ClienteCategoria = ? AND c.ClienteSexo = ?
        GROUP BY c.ClienteId, c.ClienteNombre, c.ClienteCategoria, c.ClienteSexo
        HAVING COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) > 0
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(query, [categoriaStr, sexoStr]);

      const ranking = results.map((jugador: any, index: number) => {
        let nombreLimpio = (jugador.nombre || "").trim();
        // Remover "00" al final del nombre si existe
        if (nombreLimpio.endsWith("00")) {
          nombreLimpio = nombreLimpio.slice(0, -2).trim();
        }
        return {
          id: jugador.id,
          nombre: nombreLimpio,
          categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
          sexo: jugador.sexo,
          puntos: jugador.puntos || 0,
          partidosJugados: jugador.partidosJugados || 0,
          position: index + 1,
        };
      });

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
        500
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
          SUM(CASE 
            WHEN pj.PartidoJugadorResultado = 'G' THEN 100 
            WHEN pj.PartidoJugadorResultado = 'P' THEN 30 
            ELSE 0 
          END) as puntos,
          COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados
        FROM clientes c
        INNER JOIN PartidoJugador pj ON c.ClienteId = pj.ClienteId
        INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
        GROUP BY c.ClienteId, c.ClienteNombre, c.ClienteCategoria, c.ClienteSexo
        HAVING COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) > 0
        ORDER BY puntos DESC, partidosJugados DESC
        LIMIT ?
      `;

      const results = await queryAsync(query, [limit]);

      const ranking = results.map((jugador: any, index: number) => {
        let nombreLimpio = (jugador.nombre || "").trim();
        // Remover "00" al final del nombre si existe
        if (nombreLimpio.endsWith("00")) {
          nombreLimpio = nombreLimpio.slice(0, -2).trim();
        }
        return {
          id: jugador.id,
          nombre: nombreLimpio,
          categoria: parseInt(jugador.categoria) || 0,
          sexo: jugador.sexo,
          puntos: jugador.puntos || 0,
          partidosJugados: jugador.partidosJugados || 0,
          position: index + 1,
        };
      });

      res.json({
        success: true,
        data: ranking,
        count: ranking.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getTopJugadores:", error);
      throw new AppError(
        error.message || "Error al obtener top jugadores",
        500
      );
    }
  },

  // Obtener categorías que tienen datos (jugadores con partidos)
  getCategoriasConDatos: async (req: Request, res: Response) => {
    try {
      // Query para obtener todas las combinaciones de categoría y sexo que tienen datos
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
        HAVING COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) > 0
        ORDER BY c.ClienteCategoria DESC, c.ClienteSexo ASC
      `;

      const results = await queryAsync(query, []);

      const categorias = results.map((item: any) => ({
        categoria: parseInt(item.categoria) || 0,
        sexo: item.sexo,
        cantidadJugadores: item.cantidadJugadores || 0,
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

  // Ranking por competencia con filtros de categoría y sexo
  getRankingCompetencia: async (req: Request, res: Response) => {
    try {
      const { competenciaId, categoria = "8", sexo = "M" } = req.query;
      const competenciaIdNum = parseInt(competenciaId as string);
      const categoriaStr = categoria.toString();
      const sexoStr = sexo.toString().toUpperCase();

      if (!competenciaId || isNaN(competenciaIdNum)) {
        throw new AppError("ID de competencia requerido", 400);
      }

      console.log("🔍 Buscando ranking de competencia:", {
        competenciaId: competenciaIdNum,
        categoria: categoriaStr,
        sexo: sexoStr,
      });

      // Primero obtener las fechas de la competencia
      const competenciaQuery = `
        SELECT CompetenciaFechaInicio, CompetenciaFechaFin, CompetenciaNombre
        FROM Competencia 
        WHERE CompetenciaId = ?
      `;

      const competenciaResults = await queryAsync(competenciaQuery, [
        competenciaIdNum,
      ]);

      if (competenciaResults.length === 0) {
        throw new AppError("Competencia no encontrada", 404);
      }

      const { CompetenciaFechaInicio, CompetenciaFechaFin, CompetenciaNombre } =
        competenciaResults[0];

      // Query para obtener ranking de la competencia con puntos de partidos y torneos
      const rankingQuery = `
        SELECT 
          c.ClienteId as id,
          c.ClienteNombre as nombre,
          c.ClienteCategoria as categoria,
          c.ClienteSexo as sexo,
          (
            COALESCE(puntos_partidos.puntos, 0) +
            COALESCE(puntos_torneos.puntos, 0)
          ) as puntos,
          COALESCE(puntos_partidos.partidosJugados, 0) as partidosJugados,
          COALESCE(puntos_torneos.subTorneos, 0) as subTorneos,
          COALESCE(campeones.torneosCampeon, 0) as torneosCampeon,
          COALESCE(vicecampeones.torneosVicecampeon, 0) as torneosVicecampeon
        FROM clientes c
        LEFT JOIN (
          SELECT 
            pj.ClienteId,
            SUM(CASE 
              WHEN pj.PartidoJugadorResultado = 'G' THEN 100 
              WHEN pj.PartidoJugadorResultado = 'P' THEN 30 
              ELSE 0 
            END) as puntos,
            COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados
          FROM PartidoJugador pj
          INNER JOIN Partido p ON pj.PartidoId = p.PartidoId 
            AND p.PartidoSexo != 'X'
            AND p.PartidoFecha >= ? 
            AND p.PartidoFecha <= ?
          GROUP BY pj.ClienteId
        ) puntos_partidos ON c.ClienteId = puntos_partidos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            SUM(CASE 
              WHEN tj.TorneoJugadorRol = 'C' THEN 1000
              WHEN tj.TorneoJugadorRol = 'V' THEN 500
              ELSE 0
            END) as puntos,
            COUNT(DISTINCT tj.TorneoId) as subTorneos
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ?
            AND t.TorneoFechaInicio >= ?
            AND t.TorneoFechaFin <= ?
          GROUP BY tj.ClienteId
        ) puntos_torneos ON c.ClienteId = puntos_torneos.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosCampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ?
            AND t.TorneoFechaInicio >= ?
            AND t.TorneoFechaFin <= ?
            AND tj.TorneoJugadorRol = 'C'
          GROUP BY tj.ClienteId
        ) campeones ON c.ClienteId = campeones.ClienteId
        LEFT JOIN (
          SELECT 
            tj.ClienteId,
            COUNT(DISTINCT tj.TorneoId) as torneosVicecampeon
          FROM torneojugador tj
          INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
          WHERE t.TorneoCategoria = ?
            AND t.TorneoFechaInicio >= ?
            AND t.TorneoFechaFin <= ?
            AND tj.TorneoJugadorRol = 'V'
          GROUP BY tj.ClienteId
        ) vicecampeones ON c.ClienteId = vicecampeones.ClienteId
        WHERE c.ClienteCategoria = ? 
          AND c.ClienteSexo = ?
          AND (puntos_partidos.partidosJugados > 0 OR puntos_torneos.subTorneos > 0)
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(rankingQuery, [
        CompetenciaFechaInicio,
        CompetenciaFechaFin,
        categoriaStr,
        CompetenciaFechaInicio,
        CompetenciaFechaFin,
        categoriaStr,
        CompetenciaFechaInicio,
        CompetenciaFechaFin,
        categoriaStr,
        CompetenciaFechaInicio,
        CompetenciaFechaFin,
        categoriaStr,
        sexoStr,
      ]);

      // Agregar posición y limpiar nombre (remover "00" al final si existe)
      const ranking = results.map((jugador: any, index: number) => {
        let nombreLimpio = (jugador.nombre || "").trim();
        // Remover "00" al final del nombre si existe
        if (nombreLimpio.endsWith("00")) {
          nombreLimpio = nombreLimpio.slice(0, -2).trim();
        }
        return {
          id: jugador.id,
          nombre: nombreLimpio,
          categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
          sexo: jugador.sexo,
          puntos: Number(jugador.puntos) || 0,
          partidosJugados: Number(jugador.partidosJugados) || 0,
          subTorneos: Number(jugador.subTorneos) || 0,
          torneosCampeon: Number(jugador.torneosCampeon) || 0,
          torneosVicecampeon: Number(jugador.torneosVicecampeon) || 0,
          position: index + 1,
        };
      });

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
        500
      );
    }
  },
};
