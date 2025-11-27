import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { competenciaController } from "../controllers/competenciaController";

export const competenciaRouter = Router();

// Obtener todas las competencias
competenciaRouter.get("/", asyncHandler(competenciaController.getAll));

// Obtener competencia por ID
competenciaRouter.get("/:id", asyncHandler(competenciaController.getById));

// Crear nueva competencia
competenciaRouter.post("/", asyncHandler(competenciaController.create));

// Actualizar competencia
competenciaRouter.put("/:id", asyncHandler(competenciaController.update));

// Eliminar competencia
competenciaRouter.delete("/:id", asyncHandler(competenciaController.delete));

