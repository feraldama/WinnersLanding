import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
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
    const competencias = await prisma.competencia.findMany({
      include: {
        _count: {
          select: { partidos: true },
        },
      },
      orderBy: {
        fechaInicio: "desc",
      },
    });

    res.json({
      success: true,
      data: competencias,
      count: competencias.length,
    });
  },

  getById: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const competencia = await prisma.competencia.findUnique({
      where: { id },
      include: {
        partidos: {
          include: {
            partidosJugador: {
              include: {
                jugador: true,
              },
            },
          },
        },
      },
    });

    if (!competencia) {
      throw new AppError("Competencia no encontrada");
    }

    res.json({
      success: true,
      data: competencia,
    });
  },

  create: async (req: Request, res: Response) => {
    const validatedData = competenciaSchema.parse(req.body);

    const competencia = await prisma.competencia.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: competencia,
      message: "Competencia creada exitosamente",
    });
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const validatedData = competenciaUpdateSchema.parse(req.body);

    const competenciaExistente = await prisma.competencia.findUnique({
      where: { id },
    });

    if (!competenciaExistente) {
      throw new AppError("Competencia no encontrada");
    }

    const competencia = await prisma.competencia.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: competencia,
      message: "Competencia actualizada exitosamente",
    });
  },

  delete: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const competencia = await prisma.competencia.findUnique({
      where: { id },
      include: {
        _count: {
          select: { partidos: true },
        },
      },
    });

    if (!competencia) {
      throw new AppError("Competencia no encontrada");
    }

    if (competencia._count.partidos > 0) {
      throw new AppError(
        "No se puede eliminar una competencia con partidos asociados"
      );
    }

    await prisma.competencia.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Competencia eliminada exitosamente",
    });
  },
};

