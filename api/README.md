# Winners Landing API

Backend API para el sistema de rankings de Winners Landing.

## 🚀 Tecnologías

- **Node.js** con **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para base de datos
- **Zod** - Validación de esquemas
- **PostgreSQL/MySQL/SQLite** - Base de datos

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Base de datos PostgreSQL, MySQL o SQLite configurada
- npm o pnpm instalado

## 🔧 Instalación

1. Instalar dependencias:

```bash
npm install
# o
pnpm install
```

2. Configurar variables de entorno:

```bash
cp env.example .env
```

Edita el archivo `.env` y configura:

- `DATABASE_URL`: URL de conexión a tu base de datos
- `PORT`: Puerto del servidor (default: 3001)
- `CORS_ORIGIN`: URL del frontend (default: http://localhost:5173)

## 🗄️ Base de Datos

### Configurar Prisma

1. Generar el cliente de Prisma:

```bash
npm run prisma:generate
```

2. Crear y ejecutar migraciones:

```bash
npm run prisma:migrate
```

3. (Opcional) Poblar la base de datos con datos de ejemplo:

```bash
npm run prisma:seed
```

### Esquema de Base de Datos

El esquema incluye:

- **Categorias**: Categorías de jugadores (ej: "8 - M", "8 - F")
- **Jugadores**: Información de jugadores con puntos, juegos, categoría

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

### Modo Producción

```bash
npm run build
npm start
```

## 📡 Endpoints API

### Health Check

- `GET /health` - Verificar estado del servidor

### Jugadores

- `GET /api/jugadores` - Obtener todos los jugadores
- `GET /api/jugadores/:id` - Obtener jugador por ID
- `GET /api/jugadores/categoria/:categoriaId` - Obtener jugadores por categoría
- `POST /api/jugadores` - Crear nuevo jugador
- `PUT /api/jugadores/:id` - Actualizar jugador
- `DELETE /api/jugadores/:id` - Eliminar jugador (soft delete)

### Categorías

- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/:id` - Obtener categoría por ID
- `POST /api/categorias` - Crear nueva categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Rankings

- `GET /api/rankings` - Obtener ranking general
- `GET /api/rankings/categoria/:categoriaId` - Obtener ranking por categoría
- `GET /api/rankings/top/:limit` - Obtener top N jugadores

## 📝 Ejemplo de Uso

### Crear un jugador

```bash
POST /api/jugadores
Content-Type: application/json

{
  "nombre": "Esteban Zubeldia",
  "puntos": 2290,
  "juegos": 32,
  "categoriaId": 1
}
```

### Obtener ranking por categoría

```bash
GET /api/rankings/categoria/1
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor en producción
- `npm run prisma:generate` - Generar cliente de Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio (GUI)
- `npm run prisma:seed` - Poblar base de datos con datos de ejemplo

## 📁 Estructura del Proyecto

```
api/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos de ejemplo
├── src/
│   ├── controllers/       # Controladores
│   ├── routes/            # Rutas
│   ├── middleware/        # Middleware
│   ├── lib/               # Utilidades (Prisma client)
│   └── index.ts           # Punto de entrada
├── .env                   # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🔒 Seguridad

- Asegúrate de no exponer el archivo `.env` en el repositorio
- Configura CORS apropiadamente para producción
- Considera agregar autenticación si es necesario

## 📞 Soporte

Para más información, consulta la documentación de:

- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
