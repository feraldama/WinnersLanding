import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const jugadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  puntos: z.number().int().min(0).default(0),
  juegos: z.number().int().min(0).default(0),
  imagen: z.string().optional(),
  categoriaId: z.number().int().positive("La categoría es requerida"),
  activo: z.boolean().default(true),
});

const jugadorUpdateSchema = jugadorSchema.partial();

export const jugadoresController = {
  getAll: async (req: Request, res: Response) => {
    const { categoriaId, activo } = req.query;

    const where: any = {};
    if (categoriaId) where.categoriaId = parseInt(categoriaId as string);
    if (activo !== undefined) where.activo = activo === "true";

    const jugadores = await prisma.jugador.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: [{ puntos: "desc" }, { nombre: "asc" }],
    });

    res.json({
      success: true,
      data: jugadores,
      count: jugadores.length,
    });
  },

  getById: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const jugador = await prisma.jugador.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });

    if (!jugador) {
      throw new AppError("Jugador no encontrado");
    }

    res.json({
      success: true,
      data: jugador,
    });
  },

  getByCategoria: async (req: Request, res: Response) => {
    const categoriaId = parseInt(req.params.categoriaId);

    if (isNaN(categoriaId)) {
      throw new AppError("ID de categoría inválido");
    }

    const jugadores = await prisma.jugador.findMany({
      where: {
        categoriaId,
        activo: true,
      },
      include: {
        categoria: true,
      },
      orderBy: [{ puntos: "desc" }, { nombre: "asc" }],
    });

    res.json({
      success: true,
      data: jugadores,
      count: jugadores.length,
    });
  },

  create: async (req: Request, res: Response) => {
    const validatedData = jugadorSchema.parse(req.body);

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: validatedData.categoriaId },
    });

    if (!categoria) {
      throw new AppError("Categoría no encontrada");
    }

    const jugador = await prisma.jugador.create({
      data: validatedData,
      include: {
        categoria: true,
      },
    });

    res.status(201).json({
      success: true,
      data: jugador,
      message: "Jugador creado exitosamente",
    });
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const validatedData = jugadorUpdateSchema.parse(req.body);

    // Verificar que el jugador existe
    const jugadorExistente = await prisma.jugador.findUnique({
      where: { id },
    });

    if (!jugadorExistente) {
      throw new AppError("Jugador no encontrado");
    }

    // Si se actualiza la categoría, verificar que existe
    if (validatedData.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: validatedData.categoriaId },
      });

      if (!categoria) {
        throw new AppError("Categoría no encontrada");
      }
    }

    const jugador = await prisma.jugador.update({
      where: { id },
      data: validatedData,
      include: {
        categoria: true,
      },
    });

    res.json({
      success: true,
      data: jugador,
      message: "Jugador actualizado exitosamente",
    });
  },

  delete: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const jugador = await prisma.jugador.findUnique({
      where: { id },
    });

    if (!jugador) {
      throw new AppError("Jugador no encontrado");
    }

    // Soft delete - marcar como inactivo
    await prisma.jugador.update({
      where: { id },
      data: { activo: false },
    });

    res.json({
      success: true,
      message: "Jugador eliminado exitosamente",
    });
  },
};
