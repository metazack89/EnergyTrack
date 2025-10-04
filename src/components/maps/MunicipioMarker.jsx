import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} MunicipioMarkerProps
 * @property {Object} municipio - Datos del municipio
 * @property {number} x - Coordenada X en el SVG
 * @property {number} y - Coordenada Y en el SVG
 * @property {string} color - Color del marcador
 * @property {number} intensity - Intensidad del consumo (0-1)
 * @property {boolean} isSelected - Si está seleccionado
 * @property {Function} onClick - Callback al hacer click
 */

/**
 * Marcador individual de municipio en el mapa
 * Muestra punto con pulso animado y tooltip
 */
const MunicipioMarker = ({
  municipio,
  x,
  y,
  color = '#3b82f6',
  intensity = 0.5,
  isSelected = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calcular tamaño del marcador basado en intensidad
  const baseRadius = 8;
  const radius = baseRadius + intensity * 6; // 8-14px

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Círculo de pulso (animado) */}
      {(isSelected || isHovered) && (
        <motion.circle
          cx={x}
          cy={y}
          r={radius}
          fill={color}
          opacity={0.3}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Círculo principal del marcador */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        stroke="#fff"
        strokeWidth="2"
        opacity={isSelected ? 1 : 0.8}
        style={{
          filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Punto central */}
      <circle cx={x} cy={y} r={3} fill="#fff" opacity={0.8} />

      {/* Tooltip (hover) */}
      {isHovered && (
        <g>
          {/* Fondo del tooltip */}
          <rect
            x={x + 15}
            y={y - 30}
            width={municipio.nombre.length * 7 + 20}
            height={40}
            rx={6}
            fill="#1f2937"
            opacity={0.95}
          />

          {/* Texto del nombre */}
          <text x={x + 25} y={y - 15} fill="#fff" fontSize="12" fontWeight="600">
            {municipio.nombre}
          </text>

          {/* Intensidad */}
          <text x={x + 25} y={y - 2} fill="#e5e7eb" fontSize="10">
            Intensidad: {Math.round(intensity * 100)}%
          </text>
        </g>
      )}
    </g>
  );
};

export default MunicipioMarker;
