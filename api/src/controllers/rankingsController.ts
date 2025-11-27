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

      // Query SQL directo (igual que en tu otro proyecto)
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
          COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) as partidosJugados,
          0 as subTorneos
        FROM clientes c
        INNER JOIN PartidoJugador pj ON c.ClienteId = pj.ClienteId
        INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
        WHERE c.ClienteCategoria = ? AND c.ClienteSexo = ?
        GROUP BY c.ClienteId, c.ClienteNombre, c.ClienteCategoria, c.ClienteSexo
        HAVING COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) > 0
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(query, [categoriaStr, sexoStr]);

      // Agregar posición
      const ranking = results.map((jugador: any, index: number) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
        sexo: jugador.sexo,
        puntos: jugador.puntos || 0,
        partidosJugados: jugador.partidosJugados || 0,
        subTorneos: jugador.subTorneos || 0,
        position: index + 1,
      }));

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
        500
      );
    }
  },

  getRankingGeneral: async (req: Request, res: Response) => {
    try {
      // Query SQL directo para obtener todos los jugadores activos
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
      `;

      const results = await queryAsync(query, []);

      const ranking = results.map((jugador: any, index: number) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        categoria: parseInt(jugador.categoria) || 0,
        sexo: jugador.sexo,
        puntos: jugador.puntos || 0,
        partidosJugados: jugador.partidosJugados || 0,
        position: index + 1,
      }));

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

      const ranking = results.map((jugador: any, index: number) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
        sexo: jugador.sexo,
        puntos: jugador.puntos || 0,
        partidosJugados: jugador.partidosJugados || 0,
        position: index + 1,
      }));

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

      const ranking = results.map((jugador: any, index: number) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        categoria: parseInt(jugador.categoria) || 0,
        sexo: jugador.sexo,
        puntos: jugador.puntos || 0,
        partidosJugados: jugador.partidosJugados || 0,
        position: index + 1,
      }));

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

      // Query para obtener ranking de la competencia
      const rankingQuery = `
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
        WHERE c.ClienteCategoria = ? 
          AND c.ClienteSexo = ?
          AND p.PartidoFecha >= ? 
          AND p.PartidoFecha <= ?
        GROUP BY c.ClienteId, c.ClienteNombre, c.ClienteCategoria, c.ClienteSexo
        HAVING COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IS NOT NULL AND pj.PartidoJugadorResultado != '' THEN pj.PartidoId END) > 0
        ORDER BY puntos DESC, partidosJugados DESC
      `;

      const results = await queryAsync(rankingQuery, [
        categoriaStr,
        sexoStr,
        CompetenciaFechaInicio,
        CompetenciaFechaFin,
      ]);

      // Agregar posición
      const ranking = results.map((jugador: any, index: number) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        categoria: parseInt(jugador.categoria) || parseInt(categoriaStr),
        sexo: jugador.sexo,
        puntos: jugador.puntos || 0,
        partidosJugados: jugador.partidosJugados || 0,
        position: index + 1,
      }));

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
