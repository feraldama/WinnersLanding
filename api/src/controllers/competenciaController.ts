import { Request, Response } from "express";
import { queryAsync } from "../config/db";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const competenciaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
});

const competenciaUpdateSchema = competenciaSchema.partial();

export const competenciaController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 1000;
      const sortBy = (req.query.sortBy as string) || "CompetenciaId";
      const sortOrder =
        (req.query.sortOrder as string)?.toUpperCase() || "DESC";

      // Validar campos de ordenamiento
      const allowedSortFields = [
        "CompetenciaId",
        "CompetenciaNombre",
        "CompetenciaFechaInicio",
        "CompetenciaFechaFin",
      ];
      const allowedSortOrders = ["ASC", "DESC"];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "CompetenciaId";
      const order = allowedSortOrders.includes(sortOrder) ? sortOrder : "DESC";

      const query = `
        SELECT 
          CompetenciaId as id,
          CompetenciaNombre as nombre,
          CompetenciaFechaInicio as fechaInicio,
          CompetenciaFechaFin as fechaFin
        FROM Competencia
        ORDER BY ${sortField} ${order}
        LIMIT ?
      `;

      const competencias = await queryAsync(query, [limit]);

      res.json({
        success: true,
        data: competencias,
        count: competencias.length,
      });
    } catch (error: any) {
      console.error("❌ Error en getAll competencias:", error);
      throw new AppError(error.message || "Error al obtener competencias", 500);
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido");
      }

      const query = `
        SELECT 
          CompetenciaId as id,
          CompetenciaNombre as nombre,
          CompetenciaFechaInicio as fechaInicio,
          CompetenciaFechaFin as fechaFin
        FROM Competencia
        WHERE CompetenciaId = ?
      `;

      const results = await queryAsync(query, [id]);

      if (results.length === 0) {
        throw new AppError("Competencia no encontrada", 404);
      }

      res.json({
        success: true,
        data: results[0],
      });
    } catch (error: any) {
      console.error("❌ Error en getById competencia:", error);
      throw new AppError(
        error.message || "Error al obtener competencia",
        error.statusCode || 500
      );
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const validatedData = competenciaSchema.parse(req.body);

      const query = `
        INSERT INTO Competencia (CompetenciaNombre, CompetenciaFechaInicio, CompetenciaFechaFin)
        VALUES (?, ?, ?)
      `;

      await queryAsync(query, [
        validatedData.nombre,
        validatedData.fechaInicio,
        validatedData.fechaFin,
      ]);

      // Obtener la competencia recién creada
      const getQuery = `
        SELECT 
          CompetenciaId as id,
          CompetenciaNombre as nombre,
          CompetenciaFechaInicio as fechaInicio,
          CompetenciaFechaFin as fechaFin
        FROM Competencia
        ORDER BY CompetenciaId DESC
        LIMIT 1
      `;

      const results = await queryAsync(getQuery, []);
      const competencia = results[0];

      res.status(201).json({
        success: true,
        data: competencia,
        message: "Competencia creada exitosamente",
      });
    } catch (error: any) {
      console.error("❌ Error en create competencia:", error);
      throw new AppError(error.message || "Error al crear competencia", 500);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido");
      }

      const validatedData = competenciaUpdateSchema.parse(req.body);

      // Verificar que la competencia existe
      const checkQuery = `SELECT CompetenciaId FROM Competencia WHERE CompetenciaId = ?`;
      const checkResults = await queryAsync(checkQuery, [id]);

      if (checkResults.length === 0) {
        throw new AppError("Competencia no encontrada", 404);
      }

      // Construir query de actualización dinámicamente
      const updates: string[] = [];
      const values: any[] = [];

      if (validatedData.nombre) {
        updates.push("CompetenciaNombre = ?");
        values.push(validatedData.nombre);
      }
      if (validatedData.fechaInicio) {
        updates.push("CompetenciaFechaInicio = ?");
        values.push(validatedData.fechaInicio);
      }
      if (validatedData.fechaFin) {
        updates.push("CompetenciaFechaFin = ?");
        values.push(validatedData.fechaFin);
      }

      if (updates.length === 0) {
        throw new AppError("No hay campos para actualizar", 400);
      }

      values.push(id);
      const updateQuery = `
        UPDATE Competencia
        SET ${updates.join(", ")}
        WHERE CompetenciaId = ?
      `;

      await queryAsync(updateQuery, values);

      // Obtener la competencia actualizada
      const getQuery = `
        SELECT 
          CompetenciaId as id,
          CompetenciaNombre as nombre,
          CompetenciaFechaInicio as fechaInicio,
          CompetenciaFechaFin as fechaFin
        FROM Competencia
        WHERE CompetenciaId = ?
      `;

      const results = await queryAsync(getQuery, [id]);
      const competencia = results[0];

      res.json({
        success: true,
        data: competencia,
        message: "Competencia actualizada exitosamente",
      });
    } catch (error: any) {
      console.error("❌ Error en update competencia:", error);
      throw new AppError(
        error.message || "Error al actualizar competencia",
        error.statusCode || 500
      );
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido");
      }

      // Verificar que la competencia existe
      const checkQuery = `SELECT CompetenciaId FROM Competencia WHERE CompetenciaId = ?`;
      const checkResults = await queryAsync(checkQuery, [id]);

      if (checkResults.length === 0) {
        throw new AppError("Competencia no encontrada", 404);
      }

      // Verificar si tiene partidos asociados
      const partidosQuery = `SELECT COUNT(*) as count FROM Partido WHERE CompetenciaId = ?`;
      const partidosResults = await queryAsync(partidosQuery, [id]);

      if (partidosResults[0].count > 0) {
        throw new AppError(
          "No se puede eliminar una competencia con partidos asociados",
          400
        );
      }

      // Eliminar la competencia
      const deleteQuery = `DELETE FROM Competencia WHERE CompetenciaId = ?`;
      await queryAsync(deleteQuery, [id]);

      res.json({
        success: true,
        message: "Competencia eliminada exitosamente",
      });
    } catch (error: any) {
      console.error("❌ Error en delete competencia:", error);
      throw new AppError(
        error.message || "Error al eliminar competencia",
        error.statusCode || 500
      );
    }
  },
};
