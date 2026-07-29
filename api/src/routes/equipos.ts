import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { equiposController } from "../controllers/equiposController";

export const equiposRouter = Router();

// Equipos activos con jugadores (id, nombre, logo en base64)
equiposRouter.get("/", asyncHandler(equiposController.getEquipos));
