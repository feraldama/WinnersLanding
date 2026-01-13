import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { rankingsController } from "../controllers/rankingsController";

export const rankingsRouter = Router();

// Obtener categorías que tienen datos
rankingsRouter.get(
  "/categorias-con-datos",
  asyncHandler(rankingsController.getCategoriasConDatos)
);

// Obtener ranking global con filtros (categoría y sexo)
rankingsRouter.get(
  "/global",
  asyncHandler(rankingsController.getRankingGlobal)
);

// Obtener ranking general (sin filtros)
rankingsRouter.get("/", asyncHandler(rankingsController.getRankingGeneral));

// Obtener ranking por categoría
rankingsRouter.get(
  "/categoria/:categoriaId",
  asyncHandler(rankingsController.getRankingByCategoria)
);

// Obtener top N jugadores
rankingsRouter.get(
  "/top/:limit",
  asyncHandler(rankingsController.getTopJugadores)
);

// Obtener ranking por competencia
rankingsRouter.get(
  "/competencia",
  asyncHandler(rankingsController.getRankingCompetencia)
);
