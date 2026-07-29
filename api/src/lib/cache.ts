/**
 * Caché en memoria con TTL para las respuestas del ranking.
 *
 * La pantalla es un kiosco: refresca cada 10 segundos y todos los que la miran
 * ven exactamente lo mismo. Sin caché, cada cliente conectado dispara dos
 * consultas pesadas cada 10 segundos contra la base de producción.
 *
 * Un TTL de 30 segundos es invisible para el que mira (el ranking cambia cuando
 * se cargan partidos, no cada segundo) y baja la carga a una consulta cada 30s
 * sin importar cuántas pantallas haya.
 *
 * Es por proceso y no se invalida al cargar un partido desde el admin: el
 * cambio se ve, como máximo, 30 segundos después.
 */
const TTL_MS = 30_000;

interface Entrada {
  expiraEn: number;
  valor: unknown;
}

const entradas = new Map<string, Entrada>();

/**
 * Devuelve el valor cacheado para `clave` o ejecuta `producir` y lo guarda.
 * Si `producir` falla, no se cachea nada y el error se propaga.
 */
export const conCache = async <T>(
  clave: string,
  producir: () => Promise<T>
): Promise<T> => {
  const ahora = Date.now();
  const entrada = entradas.get(clave);

  if (entrada && entrada.expiraEn > ahora) {
    return entrada.valor as T;
  }

  const valor = await producir();
  entradas.set(clave, { expiraEn: ahora + TTL_MS, valor });

  // Limpieza oportunista: sin esto el Map crece con cada combinación de filtros.
  if (entradas.size > 200) {
    for (const [k, v] of entradas) {
      if (v.expiraEn <= ahora) entradas.delete(k);
    }
  }

  return valor;
};

/** Vacía el caché. Sólo para pruebas. */
export const limpiarCache = () => entradas.clear();
