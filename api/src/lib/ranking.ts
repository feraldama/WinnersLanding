import { queryAsync } from "../config/db";

/**
 * Escala de puntos del ranking.
 * Debe mantenerse igual a la de WinnersRanking/api/controllers/ranking.controller.js:
 * las dos APIs leen la misma base y muestran los mismos puntos.
 */
export const PUNTOS = {
  PARTIDO_GANADO: 3,
  PARTIDO_PERDIDO: 1,
  TORNEO_CAMPEON: 5,
  TORNEO_VICECAMPEON: 3,
};

interface OpcionesSubquery {
  /** Agrega dos parámetros: fechaInicio, fechaFin */
  fechas?: boolean;
  /** Agrega un parámetro: categoria */
  categoria?: boolean;
}

/** Puntos, partidos jugados, ganados y perdidos por jugador. */
export const subqueryPartidos = ({ fechas = false }: OpcionesSubquery = {}) => `
  SELECT
    pj.ClienteId,
    SUM(CASE
      WHEN pj.PartidoJugadorResultado = 'G' THEN ${PUNTOS.PARTIDO_GANADO}
      WHEN pj.PartidoJugadorResultado = 'P' THEN ${PUNTOS.PARTIDO_PERDIDO}
      ELSE 0
    END) as puntos,
    -- PJ cuenta sólo resultados decididos ('G'/'P') para que siempre valga PJ = G + P.
    COUNT(DISTINCT CASE WHEN pj.PartidoJugadorResultado IN ('G', 'P') THEN pj.PartidoId END) as partidosJugados,
    SUM(CASE WHEN pj.PartidoJugadorResultado = 'G' THEN 1 ELSE 0 END) as ganados,
    SUM(CASE WHEN pj.PartidoJugadorResultado = 'P' THEN 1 ELSE 0 END) as perdidos
  FROM PartidoJugador pj
  INNER JOIN Partido p ON pj.PartidoId = p.PartidoId
    AND p.PartidoSexo != 'X'
    ${fechas ? "AND p.PartidoFecha >= ? AND p.PartidoFecha <= ?" : ""}
  GROUP BY pj.ClienteId
`;

/** Puntos de torneo y cantidad de subtorneos por jugador. */
export const subqueryTorneos = ({
  fechas = false,
  categoria = false,
}: OpcionesSubquery = {}) => `
  SELECT
    tj.ClienteId,
    SUM(CASE
      WHEN tj.TorneoJugadorRol = 'C' THEN ${PUNTOS.TORNEO_CAMPEON}
      WHEN tj.TorneoJugadorRol = 'V' THEN ${PUNTOS.TORNEO_VICECAMPEON}
      ELSE 0
    END) as puntos,
    COUNT(DISTINCT tj.TorneoId) as subTorneos
  FROM torneojugador tj
  INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
  ${
    categoria || fechas
      ? `WHERE ${[
          categoria ? "t.TorneoCategoria = ?" : null,
          fechas ? "t.TorneoFechaInicio >= ? AND t.TorneoFechaFin <= ?" : null,
        ]
          .filter(Boolean)
          .join(" AND ")}`
      : ""
  }
  GROUP BY tj.ClienteId
`;

/** Cantidad de torneos por jugador para un rol dado ('C' campeón, 'V' vicecampeón). */
export const subqueryTorneosPorRol = (
  rol: "C" | "V",
  { fechas = false, categoria = false }: OpcionesSubquery = {}
) => `
  SELECT
    tj.ClienteId,
    COUNT(DISTINCT tj.TorneoId) as cantidad
  FROM torneojugador tj
  INNER JOIN torneo t ON tj.TorneoId = t.TorneoId
  WHERE tj.TorneoJugadorRol = '${rol}'
    ${categoria ? "AND t.TorneoCategoria = ?" : ""}
    ${fechas ? "AND t.TorneoFechaInicio >= ? AND t.TorneoFechaFin <= ?" : ""}
  GROUP BY tj.ClienteId
`;

/**
 * Racha de victorias consecutivas: cuenta los partidos ganados desde el más
 * reciente hacia atrás y corta en la primera derrota. 0 si el último partido
 * decidido fue una derrota.
 *
 * Se calcula en JS y no en SQL a propósito: no requiere window functions, así
 * que funciona en cualquier versión de MySQL.
 */
export const calcularRachas = async (
  clienteIds: Array<number | string>,
  fechaInicio?: any,
  fechaFin?: any
): Promise<Map<string, number>> => {
  const rachas = new Map<string, number>();
  if (clienteIds.length === 0) return rachas;

  const placeholders = clienteIds.map(() => "?").join(", ");
  const filtrarFechas = Boolean(fechaInicio && fechaFin);
  const params: any[] = [...clienteIds];
  if (filtrarFechas) params.push(fechaInicio, fechaFin);

  const query = `
    SELECT
      pj.ClienteId,
      pj.PartidoJugadorResultado as resultado
    FROM PartidoJugador pj
    INNER JOIN Partido p ON pj.PartidoId = p.PartidoId AND p.PartidoSexo != 'X'
    WHERE pj.ClienteId IN (${placeholders})
      AND pj.PartidoJugadorResultado IN ('G', 'P')
      ${filtrarFechas ? "AND p.PartidoFecha >= ? AND p.PartidoFecha <= ?" : ""}
    ORDER BY pj.ClienteId, p.PartidoFecha DESC, p.PartidoHoraInicio DESC, pj.PartidoId DESC
  `;

  const rows = await queryAsync(query, params);

  // Los partidos vienen agrupados por jugador y del más reciente al más antiguo.
  const cortados = new Set<string>();
  for (const row of rows) {
    const id = String(row.ClienteId);
    if (!rachas.has(id)) rachas.set(id, 0);
    if (cortados.has(id)) continue;
    if (row.resultado === "G") {
      rachas.set(id, (rachas.get(id) || 0) + 1);
    } else {
      cortados.add(id);
    }
  }

  return rachas;
};

/**
 * Criterio de orden del ranking. `ClienteId` al final no es decorativo: con la
 * escala 3/1 los empates son frecuentes y sin un criterio determinista MySQL
 * puede devolver las filas empatadas en distinto orden en cada consulta. La
 * pantalla refresca cada 10 segundos, así que se verían saltar solas.
 */
export const ORDEN_RANKING =
  "ORDER BY puntos DESC, ganados DESC, partidosJugados DESC, c.ClienteId ASC";

/** Los nombres en la base a veces vienen con "00" al final. */
export const limpiarNombre = (nombre: unknown): string => {
  let limpio = String(nombre || "").trim();
  if (limpio.endsWith("00")) {
    limpio = limpio.slice(0, -2).trim();
  }
  return limpio;
};
