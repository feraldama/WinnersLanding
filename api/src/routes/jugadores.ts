import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { jugadoresController } from "../controllers/jugadoresController";

export const jugadoresRouter = Router();

// Obtener todos los jugadores
jugadoresRouter.get("/", asyncHandler(jugadoresController.getAll));

// Obtener jugador por ID
jugadoresRouter.get("/:id", asyncHandler(jugadoresController.getById));

// Crear nuevo jugador
jugadoresRouter.post("/", asyncHandler(jugadoresController.create));

// Actualizar jugador
jugadoresRouter.put("/:id", asyncHandler(jugadoresController.update));

// Eliminar jugador (soft delete)
jugadoresRouter.delete("/:id", asyncHandler(jugadoresController.delete));

// Obtener jugadores por categoría
jugadoresRouter.get(
  "/categoria/:categoriaId",
  asyncHandler(jugadoresController.getByCategoria)
);
