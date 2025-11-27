import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const categoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  sexo: z.enum(["M", "F"], {
    errorMap: () => ({ message: "El sexo debe ser M o F" }),
  }),
  descripcion: z.string().optional(),
  orden: z.number().int().min(0).default(0),
});

const categoriaUpdateSchema = categoriaSchema.partial();

export const categoriasController = {
  getAll: async (req: Request, res: Response) => {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { jugadores: true },
        },
      },
      orderBy: {
        orden: "asc",
      },
    });

    res.json({
      success: true,
      data: categorias,
      count: categorias.length,
    });
  },

  getById: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        jugadores: {
          where: { activo: true },
          orderBy: [{ puntos: "desc" }, { nombre: "asc" }],
        },
      },
    });

    if (!categoria) {
      throw new AppError("Categoría no encontrada");
    }

    res.json({
      success: true,
      data: categoria,
    });
  },

  create: async (req: Request, res: Response) => {
    const validatedData = categoriaSchema.parse(req.body);

    // Verificar que la combinación nombre + sexo no esté duplicada
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombre: validatedData.nombre,
        sexo: validatedData.sexo,
      },
    });

    if (categoriaExistente) {
      throw new AppError("Ya existe una categoría con ese nombre y sexo");
    }

    const categoria = await prisma.categoria.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: categoria,
      message: "Categoría creada exitosamente",
    });
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const validatedData = categoriaUpdateSchema.parse(req.body);

    // Verificar que la categoría existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoriaExistente) {
      throw new AppError("Categoría no encontrada");
    }

    // Si se actualiza el nombre o sexo, verificar que no esté duplicado
    if (validatedData.nombre || validatedData.sexo) {
      const nombreFinal = validatedData.nombre || categoriaExistente.nombre;
      const sexoFinal = validatedData.sexo || categoriaExistente.sexo;

      const categoriaConNombreSexo = await prisma.categoria.findFirst({
        where: {
          nombre: nombreFinal,
          sexo: sexoFinal,
        },
      });

      if (categoriaConNombreSexo && categoriaConNombreSexo.id !== id) {
        throw new AppError("Ya existe una categoría con ese nombre y sexo");
      }
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: categoria,
      message: "Categoría actualizada exitosamente",
    });
  },

  delete: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("ID inválido");
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { jugadores: true },
        },
      },
    });

    if (!categoria) {
      throw new AppError("Categoría no encontrada");
    }

    // Verificar que no tenga jugadores asociados
    if (categoria._count.jugadores > 0) {
      throw new AppError(
        "No se puede eliminar una categoría con jugadores asociados"
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  },
};
