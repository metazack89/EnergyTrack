import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} GaugeChartProps
 * @property {number} value - Valor actual (0-100)
 * @property {number} [max] - Valor máximo
 * @property {string} [title] - Título
 * @property {string} [unit] - Unidad de medida
 * @property {Array<Object>} [thresholds] - Umbrales de color
 * @property {boolean} [showTrend] - Mostrar tendencia
 * @property {number} [previousValue] - Valor anterior
 */

const GaugeChart = ({
  value = 0,
  max = 100,
  title,
  unit = '%',
  thresholds = [
    { min: 0, max: 33, color: '#10b981', label: 'Bajo' },
    { min: 33, max: 66, color: '#f59e0b', label: 'Medio' },
    { min: 66, max: 100, color: '#ef4444', label: 'Alto' },
  ],
  showTrend = false,
  previousValue,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getCurrentThreshold = () => {
    return (
      thresholds.find((t) => percentage >= t.min && percentage < t.max) ||
      thresholds[thresholds.length - 1]
    );
  };

  const currentThreshold = getCurrentThreshold();

  const getTrend = () => {
    if (!previousValue || previousValue === value) return 'neutral';
    return value > previousValue ? 'up' : 'down';
  };

  const trend = showTrend && previousValue !== undefined ? getTrend() : null;

  return (
    <Card className="p-6">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          {trend && (
            <Badge
              className={`${
                trend === 'up'
                  ? 'bg-red-100 text-red-800'
                  : trend === 'down'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
              {previousValue
                ? `${formatNumber(Math.abs(value - previousValue), 1)}${unit}`
                : 'Sin cambio'}
            </Badge>
          )}
        </div>
      )}

      {/* Gauge visual */}
      <div className="relative w-full max-w-xs mx-auto">
        {/* Semicírculo de fondo */}
        <svg viewBox="0 0 200 120" className="w-full">
          {/* Fondo del gauge */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Progreso del gauge */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={currentThreshold.color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />

          {/* Valor en el centro */}
          <text x="100" y="85" textAnchor="middle" className="text-4xl font-bold" fill="#1f2937">
            {formatNumber(value, 0)}
          </text>
          <text x="100" y="105" textAnchor="middle" className="text-sm" fill="#6b7280">
            {unit}
          </text>
        </svg>

        {/* Etiquetas de umbral */}
        <div className="flex justify-between text-xs text-gray-600 mt-2 px-2">
          <span>0</span>
          <span>{max / 2}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Leyenda de umbrales */}
      <div className="mt-6 flex justify-center gap-4">
        {thresholds.map((threshold, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: threshold.color }}
            ></div>
            <span className="text-xs text-gray-600">{threshold.label}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Estado:{' '}
        <span className="font-semibold" style={{ color: currentThreshold.color }}>
          {currentThreshold.label}
        </span>
      </p>
    </Card>
  );
};

export default GaugeChart;
