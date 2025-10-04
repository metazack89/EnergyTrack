import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MunicipioMarker from './MunicipioMarker';
import HeatMapLayer from './HeatMapLayer';
import MapLegend from './MapLegend';
import { ZoomIn, ZoomOut, Maximize2, Layers, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} InteractiveMapProps
 * @property {Array<Object>} municipios - Lista de municipios con coordenadas
 * @property {Array<Object>} [consumos] - Datos de consumo por municipio
 * @property {string} [viewMode] - Modo de visualización: 'markers' | 'heatmap'
 * @property {Function} [onMunicipioClick] - Callback al hacer click en municipio
 * @property {number} [height] - Altura del mapa en px
 */

/**
 * Mapa interactivo de Santander con marcadores y capas de calor
 * Muestra consumo energético por municipio con zoom y pan
 */
const InteractiveMap = ({
  municipios = [],
  consumos = [],
  viewMode = 'markers',
  onMunicipioClick,
  height = 600,
}) => {
  // Referencias del DOM
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Estados del componente
  const [zoom, setZoom] = useState(1); // Nivel de zoom (0.5 - 3)
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Posición del pan
  const [isDragging, setIsDragging] = useState(false); // Si está arrastrando
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Punto inicial del arrastre
  const [selectedMunicipio, setSelectedMunicipio] = useState(null); // Municipio seleccionado
  const [mode, setMode] = useState(viewMode); // Modo actual de visualización
  const [isFullscreen, setIsFullscreen] = useState(false); // Pantalla completa

  // Coordenadas del departamento de Santander (aproximadas)
  const santanderBounds = {
    minLat: 5.5,
    maxLat: 8.0,
    minLng: -74.5,
    maxLng: -72.0,
  };

  /**
   * Normalizar coordenadas geográficas a coordenadas del SVG
   * Convierte lat/lng a posición x/y en el mapa
   */
  const normalizeCoordinates = (lat, lng) => {
    const x =
      ((lng - santanderBounds.minLng) / (santanderBounds.maxLng - santanderBounds.minLng)) * 800;
    const y =
      ((santanderBounds.maxLat - lat) / (santanderBounds.maxLat - santanderBounds.minLat)) * 600;
    return { x, y };
  };

  /**
   * Calcular intensidad de consumo para color del marcador
   * Retorna un valor entre 0 y 1
   */
  const getConsumoIntensity = (municipioId) => {
    if (!consumos.length) return 0.5;

    const consumo = consumos.find((c) => c.municipio_id === municipioId);
    if (!consumo) return 0.3;

    // Normalizar entre el min y max de todos los consumos
    const valores = consumos.map((c) => c.valor_kwh);
    const min = Math.min(...valores);
    const max = Math.max(...valores);

    return (consumo.valor_kwh - min) / (max - min);
  };

  /**
   * Obtener color basado en intensidad
   * Verde (bajo) -> Amarillo (medio) -> Rojo (alto)
   */
  const getColorByIntensity = (intensity) => {
    if (intensity < 0.33) return '#10b981'; // Verde
    if (intensity < 0.66) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  /**
   * Manejar inicio del arrastre (pan)
   */
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  /**
   * Manejar movimiento del mouse durante arrastre
   */
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  /**
   * Manejar fin del arrastre
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Zoom in/out
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  /**
   * Resetear vista al estado inicial
   */
  const handleResetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  /**
   * Toggle pantalla completa
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /**
   * Manejar click en municipio
   */
  const handleMunicipioClick = (municipio) => {
    setSelectedMunicipio(municipio);
    onMunicipioClick?.(municipio);

    // Centrar en el municipio
    const coords = normalizeCoordinates(municipio.latitud, municipio.longitud);
    setPosition({
      x: -(coords.x * zoom) + 400,
      y: -(coords.y * zoom) + 300,
    });
  };

  /**
   * Limpiar listeners al desmontar
   */
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <Card className="p-4 overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mapa de Santander</h3>
            <p className="text-sm text-gray-600">{municipios.length} municipios</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === 'markers' ? 'heatmap' : 'markers')}
          >
            <Layers className="w-4 h-4 mr-2" />
            {mode === 'markers' ? 'Mapa de Calor' : 'Marcadores'}
          </Button>

          {/* Zoom controls */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="rounded-none border-r"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-3 py-1 bg-gray-50 text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="rounded-none border-l"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Fullscreen */}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden"
        style={{ height: `${height}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* SVG Map */}
        <svg
          ref={mapRef}
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Departamento outline (simplificado) */}
          <path
            d="M 100 100 L 700 100 L 700 500 L 100 500 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Heat map layer */}
          {mode === 'heatmap' && (
            <HeatMapLayer
              municipios={municipios}
              consumos={consumos}
              normalizeCoordinates={normalizeCoordinates}
            />
          )}

          {/* Markers layer */}
          {mode === 'markers' &&
            municipios.map((municipio) => {
              const coords = normalizeCoordinates(municipio.latitud, municipio.longitud);
              const intensity = getConsumoIntensity(municipio.id);
              const color = getColorByIntensity(intensity);

              return (
                <MunicipioMarker
                  key={municipio.id}
                  municipio={municipio}
                  x={coords.x}
                  y={coords.y}
                  color={color}
                  intensity={intensity}
                  isSelected={selectedMunicipio?.id === municipio.id}
                  onClick={() => handleMunicipioClick(municipio)}
                />
              );
            })}
        </svg>

        {/* Selected municipio info */}
        {selectedMunicipio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm"
          >
            <h4 className="font-semibold text-gray-900 mb-2">{selectedMunicipio.nombre}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Código DANE</p>
                <p className="font-medium">{selectedMunicipio.codigo_dane}</p>
              </div>
              <div>
                <p className="text-gray-600">Población</p>
                <p className="font-medium">
                  {selectedMunicipio.poblacion?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <MapLegend mode={mode} position="top-right" />

        {/* Reset button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetView}
          className="absolute top-4 left-4 bg-white shadow-lg"
        >
          Resetear Vista
        </Button>
      </div>
    </Card>
  );
};

export default InteractiveMap;
