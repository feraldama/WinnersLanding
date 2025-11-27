import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { jugadoresRouter } from "./routes/jugadores";
import { categoriasRouter } from "./routes/categorias";
import { rankingsRouter } from "./routes/rankings";
import { competenciaRouter } from "./routes/competencia";

// Cargar variables de entorno
dotenv.config();

// Construir DATABASE_URL si no existe pero hay variables individuales
if (!process.env.DATABASE_URL) {
  const dbHost = process.env.DB_HOST || "localhost";
  const dbUser = process.env.DB_USER || "sa";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "winners";

  // Construir URL de conexión para SQL Server
  process.env.DATABASE_URL = `sqlserver://${dbHost}:1433;database=${dbName};user=${dbUser};password=${dbPassword};encrypt=true;trustServerCertificate=true`;

  console.log("🔧 DATABASE_URL construida desde variables individuales");
}

const app = express();
const PORT = process.env.PORT || 3011;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware - CORS permisivo para todas las direcciones
app.use(cors());

// Headers CORS adicionales para asegurar compatibilidad
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Winners Landing API está funcionando",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/jugadores", jugadoresRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/rankings", rankingsRouter);
app.use("/api/competencias", competenciaRouter);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 CORS habilitado para: ${CORS_ORIGIN}`);
});
