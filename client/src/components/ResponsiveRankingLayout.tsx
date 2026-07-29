import React, { useState, useEffect, useMemo, useRef } from "react";
import svgPaths from "../imports/svg-vi2iy793k2";
import hamburgerSvg from "../imports/svg-z8vmvlzbkt";
import WinnerVector from "../imports/WinnerVector1";
import imgBackground from "../assets/d2d078fef056f8d2cddb7018c8437bb1d5a0b3cc.png";
import imgLogoPng from "../assets/909219e93634575c7d895a9f34614991a378e027.png";
import imgGeminiGeneratedImage66Ttvb66Ttvb66Tt2 from "../assets/ff4a25f7759c9ebb9bccc7cbb2466500321062d4.png";
import imgGeminiGeneratedImageIpifk3Ipifk3Ipif2 from "../assets/f581400bf2952dea157440f81b69472379930a7e.png";
import imgGeminiGeneratedImageJrc05Ljrc05Ljrc02 from "../assets/e95adb9ef364b88069c91c2e127d1d0c02593af4.png";
import {
  getRankingGlobal,
  getRankingCompetencia,
  getCategoriasConDatos,
} from "../services/ranking.service";
import type {
  JugadorRanking,
  CategoriaConDatos,
} from "../services/ranking.service";
import { getCompetencias } from "../services/competencia.service";
import { getEquipos } from "../services/equipo.service";
import type { Equipo } from "../services/equipo.service";

/**
 * OJO con los estilos de este archivo:
 * src/index.css es un CSS de Tailwind v4 YA COMPILADO y commiteado; Tailwind no
 * está instalado ni corre en el build (`vite build` solamente). Por eso sólo
 * funcionan las clases que ya existen en ese archivo: todo lo nuevo (grid,
 * tamaños, colores de G/P) va con estilos inline a propósito.
 * Si algún día se reinstala Tailwind, esto se puede pasar a clases.
 */
const estiloGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "44px minmax(90px, 1fr) minmax(110px, 1.3fr) 40px 40px 40px 52px 64px",
  gap: "4px",
  alignItems: "center",
};

const estiloTruncado: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};

const centrado: React.CSSProperties = { textAlign: "center" };

/** Oro / plata / bronce para el podio; naranja para el resto. */
const colorDePosicion = (posicion: number) => {
  if (posicion === 1) return "#ffd54a";
  if (posicion === 2) return "#d8dde4";
  if (posicion === 3) return "#d99a5b";
  return "#fe9709";
};

/**
 * Los selects nativos no se pueden maquillar con estilos inline (hacen falta
 * :hover/:focus y ::option), así que van en un <style> propio en vez de tocar
 * el index.css compilado.
 */
const CHEVRON =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2012%2012'%20fill='none'%20stroke='%23fe9709'%20stroke-width='1.7'%20stroke-linecap='round'%3E%3Cpath%20d='M2.5%204.5L6%208L9.5%204.5'/%3E%3C/svg%3E";

const ESTILOS_RANKING = `
.wr-filtros {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 14px;
  margin: 2px 0 18px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(254, 151, 9, 0.22);
  border-radius: 10px;
}
.wr-filtro {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1 1 160px;
  max-width: 230px;
  min-width: 0;
}
.wr-filtro-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  padding-left: 2px;
}
.wr-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  background-color: #141414;
  background-image: url("${CHEVRON}");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 11px 11px;
  border: 1px solid rgba(254, 151, 9, 0.45);
  border-radius: 8px;
  color: #fe9709;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 9px 30px 9px 12px;
  cursor: pointer;
  text-overflow: ellipsis;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
}
.wr-select:hover {
  border-color: #fe9709;
  background-color: #1d1a15;
}
.wr-select:focus {
  outline: none;
  border-color: #fe9709;
  box-shadow: 0 0 0 3px rgba(254, 151, 9, 0.22);
}
.wr-select option {
  background-color: #141414;
  color: #f2f2f2;
  text-transform: none;
  letter-spacing: normal;
}
.wr-fila {
  transition: background-color 0.15s ease;
}
.wr-fila:hover {
  background-color: rgba(254, 151, 9, 0.07);
}
`;

function NavigationMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    "Ranking",
    "Nosotros",
    "Instalaciones",
    "Reservas",
    "Registro de Jugadores",
    "Ranking General",
    "Contacto",
  ];

  return (
    <>
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden w-full py-4 px-4">
        <div className="bg-black rounded-[13px] px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="w-[60px] h-[60px]">
            <WinnerVector />
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer"
          >
            <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 20 20">
              <path
                d={hamburgerSvg.p188fb700}
                stroke="#fe9709"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b border-[#fe9709]">
              <div className="w-[60px] h-[60px]">
                <WinnerVector />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-[#fe9709] text-3xl"
              >
                ×
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-2 p-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className="text-left py-4 px-4 border-b border-[#fe9709]/30 hover:bg-white/10 transition-colors rounded-md"
                >
                  <p className="font-['Goldman:Regular',sans-serif] text-[#fe9709] text-lg uppercase hover:text-white transition-colors">
                    {item}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex w-full justify-center py-7">
        <div className="bg-black rounded-[13px] px-4 py-3 flex flex-wrap gap-3 lg:gap-5 justify-center">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="px-2.5 py-2.5 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded-md"
              onClick={() => {}}
            >
              <p className="font-['Goldman:Regular',sans-serif] text-[#fe9709] text-sm lg:text-[15px] uppercase leading-[14px] hover:text-white transition-colors duration-200">
                {item}
              </p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/** Racha de victorias: con llama a partir de 2 seguidas. */
function Racha({ valor }: { valor: number }) {
  if (valor <= 0) {
    return <span style={{ color: "rgba(255,255,255,0.4)" }}>–</span>;
  }
  if (valor === 1) {
    return <span>1</span>;
  }
  return (
    <span
      style={{ color: "#fe9709", whiteSpace: "nowrap" }}
      title={`${valor} victorias seguidas`}
    >
      🔥{valor}
    </span>
  );
}

interface RankingTableProps {
  categoria: string;
  sexo: string;
  players: JugadorRanking[];
  isLoading: boolean;
  tiempoTranscurrido: number;
  tiempoTotal: number;
  vista: "global" | "competencia";
  onVistaChange: (vista: "global" | "competencia") => void;
  equipos: Equipo[];
  equipoSeleccionado: string;
  onEquipoChange: (equipoId: string) => void;
  logoDeEquipo: (equipoId: string | number | null) => string | null;
}

function RankingTable({
  categoria,
  sexo,
  players,
  isLoading,
  tiempoTranscurrido,
  tiempoTotal,
  vista,
  onVistaChange,
  equipos,
  equipoSeleccionado,
  onEquipoChange,
  logoDeEquipo,
}: RankingTableProps) {
  const sexoTexto = sexo === "M" ? "Masculino" : "Femenino";
  const porcentaje =
    tiempoTotal > 0 ? (tiempoTranscurrido / tiempoTotal) * 100 : 0;
  const titulo =
    vista === "global" ? "Ranking (Global)" : "Ranking (En Competencia)";

  return (
    <div
      className="bg-gradient-to-b from-[#2a2a2a] via-[#3a3226] to-[#876a28] backdrop-blur-sm rounded-xl p-4 w-full"
      style={{ maxWidth: 760 }}
    >
      {/* Title */}
      <div className="pb-3">
        <p className="font-['Righteous:Regular',sans-serif] text-[#fe9709] text-xl text-center uppercase">
          {titulo}
        </p>
        <p className="font-['Righteous:Regular',sans-serif] text-[#fe9709] text-sm text-center uppercase mt-1">
          Categoría: {categoria} - {sexoTexto}
        </p>
      </div>

      {/* Filtros */}
      <div className="wr-filtros">
        <label className="wr-filtro">
          <span className="wr-filtro-label font-['Goldman:Regular',sans-serif]">
            Vista
          </span>
          <select
            value={vista}
            onChange={(e) =>
              onVistaChange(e.target.value as "global" | "competencia")
            }
            className="wr-select font-['Goldman:Regular',sans-serif]"
          >
            <option value="global">Global</option>
            <option value="competencia">En competencia</option>
          </select>
        </label>
        <label className="wr-filtro">
          <span className="wr-filtro-label font-['Goldman:Regular',sans-serif]">
            Equipo
          </span>
          <select
            value={equipoSeleccionado}
            onChange={(e) => onEquipoChange(e.target.value)}
            className="wr-select font-['Goldman:Regular',sans-serif]"
          >
            <option value="">Todos los equipos</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={String(equipo.id)}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Barra de progreso de la rotación automática */}
      <div className="mb-4 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3226]">
        <div
          className="h-full bg-[#fe9709] transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
          {/* Header */}
          <div className="bg-[#fe9709] rounded-md mb-1" style={{ padding: "10px 12px" }}>
            <div
              className="font-['Goldman:Regular',sans-serif] text-black uppercase"
              style={{ ...estiloGrid, fontSize: "11px" }}
            >
              <p style={centrado}>Pos</p>
              <p>Jugador</p>
              <p>Equipo</p>
              <p style={centrado}>PJ</p>
              <p style={centrado}>G</p>
              <p style={centrado}>P</p>
              <p style={centrado}>PTS</p>
              <p style={centrado}>Racha</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe9709]"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && players.length === 0 && (
            <div className="text-center py-8">
              <p className="font-['Roboto:Regular',sans-serif] text-white text-sm">
                No hay datos disponibles
              </p>
            </div>
          )}

          {/* Rows */}
          {!isLoading &&
            players.map((player, index) => {
              const logo = logoDeEquipo(player.equipoId);
              const posicion = player.position || index + 1;
              return (
                <div
                  key={player.id || index}
                  className="wr-fila"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    borderBottom:
                      index < players.length - 1
                        ? "1px solid rgba(254, 151, 9, 0.35)"
                        : "none",
                  }}
                >
                  <div
                    className="font-['Roboto:Regular',sans-serif] text-white text-sm"
                    style={estiloGrid}
                  >
                    {/* Posición */}
                    <p
                      className="font-['Righteous:Regular',sans-serif] text-xl"
                      style={{ ...centrado, color: colorDePosicion(posicion) }}
                    >
                      {posicion}
                    </p>

                    {/* Jugador + trofeos */}
                    <div
                      className="flex items-center gap-1"
                      style={{ minWidth: 0 }}
                    >
                      <span style={estiloTruncado}>{player.nombre}</span>
                      {(player.torneosCampeon ?? 0) > 0 && (
                        <span
                          className="flex items-center gap-0.5"
                          style={{ flexShrink: 0 }}
                        >
                          {Array.from({
                            length: Number(player.torneosCampeon) || 0,
                          }).map((_, i) => (
                            <span
                              key={`campeon-${i}`}
                              className="text-yellow-400"
                              title={`${player.torneosCampeon} torneo(s) como campeón`}
                            >
                              🏆
                            </span>
                          ))}
                        </span>
                      )}
                      {(player.torneosVicecampeon ?? 0) > 0 && (
                        <span
                          className="flex items-center gap-0.5"
                          style={{ flexShrink: 0 }}
                        >
                          {Array.from({
                            length: Number(player.torneosVicecampeon) || 0,
                          }).map((_, i) => (
                            <span
                              key={`vicecampeon-${i}`}
                              className="text-gray-300"
                              title={`${player.torneosVicecampeon} torneo(s) como vicecampeón`}
                            >
                              🥈
                            </span>
                          ))}
                        </span>
                      )}
                    </div>

                    {/* Equipo */}
                    <div
                      className="flex items-center"
                      style={{ minWidth: 0, gap: "6px" }}
                    >
                      {player.equipoNombre ? (
                        <>
                          {logo && (
                            <img
                              src={`data:image/png;base64,${logo}`}
                              alt={player.equipoNombre}
                              className="object-contain"
                              style={{ width: 20, height: 20, flexShrink: 0 }}
                            />
                          )}
                          <span
                            style={{ ...estiloTruncado, fontSize: "12px" }}
                          >
                            {player.equipoNombre}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "12px",
                          }}
                        >
                          –
                        </span>
                      )}
                    </div>

                    <p style={centrado}>{player.partidosJugados}</p>
                    <p style={{ ...centrado, color: "#4ade80" }}>
                      {player.ganados}
                    </p>
                    <p style={{ ...centrado, color: "#f87171" }}>
                      {player.perdidos}
                    </p>
                    <p
                      className="font-['Goldman:Regular',sans-serif]"
                      style={{ ...centrado, color: "#fe9709" }}
                    >
                      {player.puntos}
                    </p>
                    <p style={centrado}>
                      <Racha valor={player.racha} />
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <p
        className="font-['Roboto:Regular',sans-serif] text-center"
        style={{
          marginTop: "12px",
          fontSize: "10px",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        PJ: Partidos Jugados · G: Ganados · P: Perdidos · PTS: Puntos (3 por
        ganado, 1 por perdido) · Racha: victorias seguidas
      </p>
    </div>
  );
}

function QRPanel() {
  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] via-[#3a3226] to-[#876a28] backdrop-blur-sm rounded-xl p-4 w-full max-w-[280px] flex flex-col items-center gap-8">
      {/* Medals */}
      <div className="relative h-[170px] w-full flex justify-center items-start">
        <img
          src={imgGeminiGeneratedImageIpifk3Ipifk3Ipif2}
          alt="Plata"
          className="absolute left-0 top-10 w-[130px] h-[130px] object-cover"
        />
        <img
          src={imgGeminiGeneratedImage66Ttvb66Ttvb66Tt2}
          alt="Oro"
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[130px] h-[130px] object-cover z-10"
        />
        <img
          src={imgGeminiGeneratedImageJrc05Ljrc05Ljrc02}
          alt="Bronce"
          className="absolute right-0 top-10 w-[130px] h-[130px] object-cover"
        />
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col items-center gap-4">
        <p className="font-['Goldman:Regular',sans-serif] text-[#fe9709] text-lg text-center uppercase leading-tight">
          Escaneá y sumate a la competencia 🚀
        </p>
        <div className="w-[193px] h-[193px]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 194 194"
          >
            <g>
              <path d={svgPaths.p3c7fa600} fill="white" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ResponsiveRankingLayout() {
  const [jugadores, setJugadores] = useState<JugadorRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoria, setCategoria] = useState("8");
  const [sexo, setSexo] = useState("M");
  const [categoriasConDatos, setCategoriasConDatos] = useState<
    CategoriaConDatos[]
  >([]);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<
    string | number
  >("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [vista, setVista] = useState<"global" | "competencia">("global");

  // Cuántas combinaciones vacías seguidas se saltearon. Evita quedar girando
  // para siempre si el equipo elegido no tiene jugadores en ninguna categoría.
  const combosVaciosRef = useRef(0);

  // Datos iniciales: categorías con datos y última competencia
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categorias = await getCategoriasConDatos();
        setCategoriasConDatos(categorias);
        if (categorias.length > 0) {
          setCategoria(categorias[0].categoria.toString());
          setSexo(categorias[0].sexo);
        }

        const competenciasResponse = await getCompetencias({ limit: 1 });
        if (competenciasResponse.data.length > 0) {
          setCompetenciaSeleccionada(competenciasResponse.data[0].id);
        }
      } catch (error) {
        console.error("❌ Error al obtener datos iniciales:", error);
      }
    };

    loadInitialData();
  }, []);

  // Los equipos se piden una sola vez: sirven para el select y para los logos
  useEffect(() => {
    const loadEquipos = async () => {
      try {
        setEquipos(await getEquipos());
      } catch (error) {
        console.error("❌ Error al obtener equipos:", error);
      }
    };
    loadEquipos();
  }, []);

  const logosPorEquipo = useMemo(() => {
    const mapa = new Map<string, string | null>();
    equipos.forEach((equipo) => mapa.set(String(equipo.id), equipo.logo));
    return mapa;
  }, [equipos]);

  const logoDeEquipo = (equipoId: string | number | null) =>
    equipoId ? logosPorEquipo.get(String(equipoId)) || null : null;

  // Combinaciones de categoría/sexo que tienen datos. Se descartan las
  // incompletas (clientes sin categoría o sexo cargado): pedir su ranking
  // devuelve 404 y no hay nada que mostrar. La categoría se compara como
  // texto: "INICIAL" es tan válida como "8".
  const combinaciones = React.useMemo(() => {
    return categoriasConDatos
      .map((cat) => ({
        categoria: String(cat.categoria ?? "").trim(),
        sexo: cat.sexo,
      }))
      .filter((cat) => cat.categoria !== "" && Boolean(cat.sexo));
  }, [categoriasConDatos]);

  const [indiceActual, setIndiceActual] = useState(0);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const tiempoTotal = 10000; // 10 segundos

  // Al cambiar de equipo se reinicia el conteo de combinaciones vacías
  useEffect(() => {
    combosVaciosRef.current = 0;
  }, [equipoSeleccionado, vista]);

  // Cargar el ranking según la vista, la combinación actual y el equipo
  useEffect(() => {
    if (combinaciones.length === 0) return;
    if (vista === "competencia" && !competenciaSeleccionada) return;

    const loadRanking = async () => {
      setIsLoading(true);
      const combo = combinaciones[indiceActual];
      let data: JugadorRanking[] = [];

      try {
        data =
          vista === "competencia"
            ? await getRankingCompetencia(
                competenciaSeleccionada,
                combo.categoria,
                combo.sexo,
                equipoSeleccionado || null
              )
            : await getRankingGlobal(
                combo.categoria,
                combo.sexo,
                equipoSeleccionado || null
              );
      } catch (error) {
        // El 404 de "no hay datos" es parte del flujo normal de la rotación:
        // se trata igual que una categoría vacía y se saltea.
        console.error("❌ Error al obtener el ranking:", error);
      }

      setJugadores(data);
      setCategoria(combo.categoria);
      setSexo(combo.sexo);

      // Una categoría sin jugadores (o que devolvió error) se saltea en vez de
      // esperar los 10 segundos: pasa seguido al filtrar por equipo. El
      // contador evita girar sin fin si ninguna combinación tiene datos.
      if (data.length === 0 && combinaciones.length > 1) {
        if (combosVaciosRef.current < combinaciones.length - 1) {
          combosVaciosRef.current += 1;
          setIndiceActual((prev) => (prev + 1) % combinaciones.length);
        }
      } else {
        combosVaciosRef.current = 0;
      }

      setIsLoading(false);
    };

    loadRanking();
  }, [
    indiceActual,
    combinaciones,
    vista,
    competenciaSeleccionada,
    equipoSeleccionado,
  ]);

  // Rotación automática de categoría/sexo cada 10 segundos
  useEffect(() => {
    if (combinaciones.length === 0) return;

    const interval = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % combinaciones.length);
    }, tiempoTotal);

    return () => clearInterval(interval);
  }, [combinaciones.length, tiempoTotal]);

  // Barra de progreso de la rotación
  useEffect(() => {
    setTiempoTranscurrido(0);

    const interval = setInterval(() => {
      setTiempoTranscurrido((prev) => (prev >= tiempoTotal ? 0 : prev + 100));
    }, 100);

    return () => clearInterval(interval);
  }, [indiceActual, tiempoTotal]);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <style>{ESTILOS_RANKING}</style>

      {/* Background Image - Fixed positioning to cover entire viewport */}
      <div className="fixed inset-0 w-full h-full overflow-clip pointer-events-none">
        <img
          src={imgBackground}
          alt=""
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <NavigationMenu />

        {/* Logo - Only for desktop */}
        <div className="flex justify-center py-4">
          <img
            src={imgLogoPng}
            alt="Winners"
            className="w-[120px] h-[120px] lg:w-[180px] lg:h-[180px]"
          />
        </div>

        {/* Tables and QR Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-stretch lg:flex-nowrap">
            <RankingTable
              categoria={categoria}
              sexo={sexo}
              players={jugadores}
              isLoading={isLoading}
              tiempoTranscurrido={tiempoTranscurrido}
              tiempoTotal={tiempoTotal}
              vista={vista}
              onVistaChange={setVista}
              equipos={equipos}
              equipoSeleccionado={equipoSeleccionado}
              onEquipoChange={setEquipoSeleccionado}
              logoDeEquipo={logoDeEquipo}
            />
            <QRPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
