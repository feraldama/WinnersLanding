import React, { useState, useEffect } from "react";
import svgPaths from "../imports/svg-vi2iy793k2";
import hamburgerSvg from "../imports/svg-z8vmvlzbkt";
import WinnerVector from "../imports/WinnerVector1";
import imgBackground from "../assets/d2d078fef056f8d2cddb7018c8437bb1d5a0b3cc.png";
import imgLogoPng from "../assets/909219e93634575c7d895a9f34614991a378e027.png";
import imgGeminiGeneratedImage66Ttvb66Ttvb66Tt2 from "../assets/ff4a25f7759c9ebb9bccc7cbb2466500321062d4.png";
import imgGeminiGeneratedImageIpifk3Ipifk3Ipif2 from "../assets/f581400bf2952dea157440f81b69472379930a7e.png";
import imgGeminiGeneratedImageJrc05Ljrc05Ljrc02 from "../assets/e95adb9ef364b88069c91c2e127d1d0c02593af4.png";
import { getRankingGlobal } from "../services/ranking.service";
import type { JugadorRanking } from "../services/ranking.service";

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

interface RankingTableProps {
  categoria: string;
  sexo: string;
  players: JugadorRanking[];
  isLoading: boolean;
  tiempoTranscurrido: number;
  tiempoTotal: number;
}

function RankingTable({
  categoria,
  sexo,
  players,
  isLoading,
  tiempoTranscurrido,
  tiempoTotal,
}: RankingTableProps) {
  const sexoTexto = sexo === "M" ? "Masculino" : "Femenino";
  const porcentaje =
    tiempoTotal > 0 ? (tiempoTranscurrido / tiempoTotal) * 100 : 0;

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] via-[#3a3226] to-[#876a28] backdrop-blur-sm rounded-xl p-4 w-full max-w-[480px]">
      {/* Title */}
      <div className="pb-3">
        <p className="font-['Righteous:Regular',sans-serif] text-[#fe9709] text-xl text-center uppercase">
          Categoría: {categoria} - {sexoTexto}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3226]">
        <div
          className="h-full bg-[#fe9709] transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-[#fe9709] rounded-md px-6 py-2.5 mb-1">
        <div className="flex justify-between items-center font-['Goldman:Regular',sans-serif] text-black text-xs">
          <p>Posición</p>
          <p>Jugador</p>
          <p>Puntos</p>
          <p>PJ</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe9709]"></div>
        </div>
      )}

      {/* Rows */}
      {!isLoading && players.length === 0 && (
        <div className="text-center py-8">
          <p className="font-['Roboto:Regular',sans-serif] text-white text-sm">
            No hay datos disponibles
          </p>
        </div>
      )}

      {!isLoading && players.length > 0 && (
        <>
          {players.map((player, index) => (
            <div
              key={player.id || index}
              className={`px-6 py-1 bg-[rgba(255,0,0,0)] ${
                index < players.length - 1 ? "border-b border-[#FE9709]" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-0.5 min-w-[50px]">
                  <p className="font-['Righteous:Regular',sans-serif] text-[#fe9709] text-xl">
                    {player.position || index + 1}
                  </p>
                </div>
                <p className="font-['Roboto:Regular',sans-serif] text-white text-sm flex-1 text-center">
                  {player.nombre}
                </p>
                <p className="font-['Roboto:Regular',sans-serif] text-white text-sm w-16 text-center">
                  {player.puntos}
                </p>
                <p className="font-['Roboto:Regular',sans-serif] text-white text-sm w-12 text-center">
                  {player.partidosJugados}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
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
  const [rankingData, setRankingData] = useState<JugadorRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoria, setCategoria] = useState("8");
  const [sexo, setSexo] = useState("M");

  // Generar todas las combinaciones de categoría y sexo
  const combinaciones = React.useMemo(() => {
    const combos: Array<{ categoria: string; sexo: string }> = [];
    for (let cat = 8; cat >= 1; cat--) {
      combos.push({ categoria: cat.toString(), sexo: "M" });
      combos.push({ categoria: cat.toString(), sexo: "F" });
    }
    return combos;
  }, []);

  // Índice actual en el array de combinaciones
  const [indiceActual, setIndiceActual] = useState(0);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const tiempoTotal = 10000; // 10 segundos en milisegundos

  // Cargar datos del ranking
  useEffect(() => {
    const loadRankingData = async () => {
      setIsLoading(true);
      try {
        const combo = combinaciones[indiceActual];
        const data = await getRankingGlobal(combo.categoria, combo.sexo);
        setRankingData(data);
        setCategoria(combo.categoria);
        setSexo(combo.sexo);
      } catch (error) {
        console.error("❌ Error al obtener ranking del backend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankingData();
  }, [indiceActual, combinaciones]);

  // Cambiar automáticamente cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % combinaciones.length);
    }, tiempoTotal);

    return () => clearInterval(interval);
  }, [combinaciones.length, tiempoTotal]);

  // Actualizar tiempo transcurrido cada 100ms para suavidad
  useEffect(() => {
    // Reiniciar el tiempo cuando cambia la categoría
    setTiempoTranscurrido(0);

    const interval = setInterval(() => {
      setTiempoTranscurrido((prev) => {
        if (prev >= tiempoTotal) {
          return 0;
        }
        return prev + 100; // Actualizar cada 100ms para suavidad
      });
    }, 100);

    return () => clearInterval(interval);
  }, [indiceActual, tiempoTotal]);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
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
              players={rankingData}
              isLoading={isLoading}
              tiempoTranscurrido={tiempoTranscurrido}
              tiempoTotal={tiempoTotal}
            />
            <RankingTable
              categoria={categoria}
              sexo={sexo}
              players={rankingData}
              isLoading={isLoading}
              tiempoTranscurrido={tiempoTranscurrido}
              tiempoTotal={tiempoTotal}
            />
            <QRPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
