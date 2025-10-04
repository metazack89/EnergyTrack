import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} LineChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {string} dataKey - Key del valor Y
 * @property {string} xAxisKey - Key del valor X
 * @property {string} [title] - Título del gráfico
 * @property {string} [color] - Color de la línea
 * @property {number} [height] - Altura en px
 * @property {boolean} [showGrid] - Mostrar cuadrícula
 * @property {boolean} [showLegend] - Mostrar leyenda
 * @property {boolean} [showTrend] - Mostrar indicador de tendencia
 * @property {number} [referenceValue] - Línea de referencia
 * @property {string} [unit] - Unidad de medida
 * @property {Function} [onPointClick] - Callback al hacer click
 */

/**
 * Gráfico de líneas temporal para tendencias
 * @param {LineChartProps} props
 */
const LineChart = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'label',
  title,
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTrend = false,
  referenceValue,
  unit = '',
  onPointClick,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-400">
          Sin datos disponibles
        </div>
      </Card>
    );
  }

  const calculateTrend = () => {
    if (data.length < 2) return null;
    const firstValue = data[0][dataKey];
    const lastValue = data[data.length - 1][dataKey];
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      value: change,
      direction: change >= 0 ? 'up' : 'down',
    };
  };

  const trend = showTrend ? calculateTrend() : null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{payload[0].payload[xAxisKey]}</p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-semibold" style={{ color }}>
            {formatNumber(payload[0].value, 0)} {unit}
          </span>
        </p>
      </div>
    );
  };

  return (
    <Card className="p-6">
      {(title || trend) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {trend && (
            <Badge
              className={`${
                trend.direction === 'up' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {trend.value > 0 ? '+' : ''}
              {formatNumber(trend.value, 1)}%
            </Badge>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsLine
          data={data}
          onClick={onPointClick}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => formatNumber(value, 0)}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}

          {referenceValue && (
            <ReferenceLine
              y={referenceValue}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{
                value: 'Referencia',
                position: 'insideTopRight',
                fill: '#6b7280',
                fontSize: 12,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 5 }}
            activeDot={{ r: 7 }}
            name={dataKey}
          />
        </RechartsLine>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
          <span>Puntos de datos: {data.length}</span>
          <span>
            Rango: {formatNumber(Math.min(...data.map((d) => d[dataKey])), 0)} -{' '}
            {formatNumber(Math.max(...data.map((d) => d[dataKey])), 0)} {unit}
          </span>
        </div>
      )}
    </Card>
  );
};

export default LineChart;
