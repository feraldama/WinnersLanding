import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { categoriasController } from "../controllers/categoriasController";

export const categoriasRouter = Router();

// Obtener todas las categorías
categoriasRouter.get("/", asyncHandler(categoriasController.getAll));

// Obtener categoría por ID
categoriasRouter.get("/:id", asyncHandler(categoriasController.getById));

// Crear nueva categoría
categoriasRouter.post("/", asyncHandler(categoriasController.create));

// Actualizar categoría
categoriasRouter.put("/:id", asyncHandler(categoriasController.update));

// Eliminar categoría
categoriasRouter.delete("/:id", asyncHandler(categoriasController.delete));
