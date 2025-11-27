import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear categorías
  const categoria1 = await prisma.categoria.upsert({
    where: {
      nombre_sexo: {
        nombre: "8",
        sexo: "M",
      },
    },
    update: {},
    create: {
      nombre: "8",
      sexo: "M",
      descripcion: "Categoría Masculina 8",
      orden: 1,
    },
  });

  const categoria2 = await prisma.categoria.upsert({
    where: {
      nombre_sexo: {
        nombre: "8",
        sexo: "F",
      },
    },
    update: {},
    create: {
      nombre: "8",
      sexo: "F",
      descripcion: "Categoría Femenina 8",
      orden: 2,
    },
  });

  console.log("✅ Categorías creadas");

  // Crear jugadores de ejemplo
  const jugadores = [
    {
      nombre: "Esteban Zubeldia",
      puntos: 2290,
      juegos: 32,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Juan Pérez",
      puntos: 2150,
      juegos: 28,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "María García",
      puntos: 2100,
      juegos: 25,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Carlos López",
      puntos: 2050,
      juegos: 30,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Ana Martínez",
      puntos: 2000,
      juegos: 22,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Pedro Sánchez",
      puntos: 1950,
      juegos: 20,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Laura Fernández",
      puntos: 1900,
      juegos: 18,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Diego Rodríguez",
      puntos: 1850,
      juegos: 24,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Sofía González",
      puntos: 1800,
      juegos: 19,
      imagen: null,
      categoriaId: categoria1.id,
    },
    {
      nombre: "Luis Hernández",
      puntos: 1750,
      juegos: 17,
      imagen: null,
      categoriaId: categoria1.id,
    },
  ];

  // Crear jugadores (evitar duplicados verificando primero)
  for (const jugador of jugadores) {
    const existe = await prisma.jugador.findFirst({
      where: {
        nombre: jugador.nombre,
        categoriaId: jugador.categoriaId,
      },
    });

    if (!existe) {
      await prisma.jugador.create({
        data: jugador,
      });
    }
  }

  console.log("✅ Jugadores creados");
  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
