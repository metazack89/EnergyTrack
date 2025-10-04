import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

/**
 * @typedef {Object} MapLegendProps
 * @property {string} mode - Modo del mapa: 'markers' | 'heatmap'
 * @property {string} [position] - Posición: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
 * @property {boolean} [showInfo] - Mostrar información adicional
 */

/**
 * Leyenda del mapa con gradiente de colores
 * Explica la escala de intensidad de consumo
 */
const MapLegend = ({ mode = 'markers', position = 'top-right', showInfo = true }) => {
  /**
   * Obtener clases de posición CSS
   */
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    };
    return positions[position] || positions['top-right'];
  };

  /**
   * Niveles de intensidad con colores
   */
  const intensityLevels = [
    { label: 'Muy Bajo', color: '#10b981', range: '0-25%' },
    { label: 'Bajo', color: '#22c55e', range: '25-40%' },
    { label: 'Moderado', color: '#f59e0b', range: '40-60%' },
    { label: 'Alto', color: '#fb923c', range: '60-80%' },
    { label: 'Muy Alto', color: '#ef4444', range: '80-100%' },
  ];

  /**
   * Información del modo actual
   */
  const modeInfo = {
    markers: {
      title: 'Vista de Marcadores',
      description: 'El tamaño y color de los puntos indica el nivel de consumo energético',
    },
    heatmap: {
      title: 'Mapa de Calor',
      description: 'Las zonas más rojas indican mayor concentración de consumo',
    },
  };

  const currentMode = modeInfo[mode];

  return (
    <Card
      className={`absolute ${getPositionClasses()} w-64 p-4 shadow-lg bg-white/95 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-primary-600" />
        <h4 className="text-sm font-semibold text-gray-900">{currentMode.title}</h4>
      </div>

      {/* Description */}
      {showInfo && <p className="text-xs text-gray-600 mb-4">{currentMode.description}</p>}

      {/* Gradient scale (visual) */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Escala de Intensidad</p>

        {/* Gradient bar */}
        <div
          className="h-6 rounded-lg overflow-hidden mb-2"
          style={{
            background: 'linear-gradient(to right, #10b981, #22c55e, #f59e0b, #fb923c, #ef4444)',
          }}
        >
          {/* Markers on gradient */}
          <div className="h-full flex items-center justify-between px-1">
            {[0, 25, 50, 75, 100].map((value, i) => (
              <div key={i} className="w-0.5 h-full bg-white/50"></div>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Detailed levels */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 mb-2">Niveles de Consumo</p>
        {intensityLevels.map((level, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Color indicator */}
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: level.color }}
              ></div>
              <span className="text-gray-700">{level.label}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {level.range}
            </Badge>
          </div>
        ))}
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Medida</span>
          <span className="font-semibold text-gray-900">kWh/mes</span>
        </div>
      </div>

      {/* Map mode indicator */}
      <div className="mt-3">
        <Badge
          className={`w-full justify-center ${
            mode === 'heatmap' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {mode === 'heatmap' ? '🔥 Mapa de Calor' : '📍 Marcadores'}
        </Badge>
      </div>
    </Card>
  );
};

export default MapLegend;
