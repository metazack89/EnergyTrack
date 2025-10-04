import { useMemo } from 'react';

/**
 * @typedef {Object} HeatMapLayerProps
 * @property {Array<Object>} municipios - Lista de municipios
 * @property {Array<Object>} consumos - Datos de consumo
 * @property {Function} normalizeCoordinates - Función para normalizar coordenadas
 */

/**
 * Capa de mapa de calor usando gradientes SVG
 * Genera visualización de intensidad con blur radial
 */
const HeatMapLayer = ({ municipios, consumos, normalizeCoordinates }) => {
  /**
   * Calcular puntos de calor con intensidad
   * Memorizado para optimizar rendimiento
   */
  const heatPoints = useMemo(() => {
    return municipios.map((municipio) => {
      const coords = normalizeCoordinates(municipio.latitud, municipio.longitud);

      // Buscar consumo del municipio
      const consumo = consumos.find((c) => c.municipio_id === municipio.id);

      // Calcular intensidad normalizada
      const valores = consumos.map((c) => c.valor_kwh);
      const min = Math.min(...valores);
      const max = Math.max(...valores);
      const intensity = consumo ? (consumo.valor_kwh - min) / (max - min) : 0.3;

      return {
        ...coords,
        intensity,
        municipio,
      };
    });
  }, [municipios, consumos]);

  /**
   * Obtener color del gradiente basado en intensidad
   * Verde -> Amarillo -> Naranja -> Rojo
   */
  const getGradientColor = (intensity) => {
    if (intensity < 0.25) return '#10b981'; // Verde
    if (intensity < 0.5) return '#f59e0b'; // Amarillo
    if (intensity < 0.75) return '#fb923c'; // Naranja
    return '#ef4444'; // Rojo
  };

  return (
    <g className="heat-map-layer">
      {/* Definir gradientes radiales para cada punto */}
      <defs>
        {heatPoints.map((point, index) => (
          <radialGradient key={`gradient-${index}`} id={`heat-gradient-${index}`} cx="50%" cy="50%">
            <stop
              offset="0%"
              stopColor={getGradientColor(point.intensity)}
              stopOpacity={point.intensity * 0.8}
            />
            <stop
              offset="50%"
              stopColor={getGradientColor(point.intensity)}
              stopOpacity={point.intensity * 0.4}
            />
            <stop offset="100%" stopColor={getGradientColor(point.intensity)} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>

      {/* Renderizar círculos de calor */}
      {heatPoints.map((point, index) => {
        // Radio basado en intensidad (30-80px)
        const radius = 30 + point.intensity * 50;

        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={radius}
            fill={`url(#heat-gradient-${index})`}
            style={{
              mixBlendMode: 'multiply', // Blend mode para superposición
              filter: 'blur(15px)', // Efecto blur para suavizar
            }}
          />
        );
      })}

      {/* Capa de overlay semi-transparente */}
      <rect width="800" height="600" fill="rgba(255, 255, 255, 0.1)" pointerEvents="none" />
    </g>
  );
};

export default HeatMapLayer;
