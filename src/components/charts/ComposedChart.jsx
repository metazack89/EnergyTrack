import {
  ComposedChart as RechartsComposed,
  Line,
  Bar,
  Area,
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
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} SeriesConfig
 * @property {string} key - Key de los datos
 * @property {string} type - Tipo: 'line' | 'bar' | 'area'
 * @property {string} [color] - Color de la serie
 * @property {string} [name] - Nombre para leyenda
 */

/**
 * @typedef {Object} ComposedChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {Array<SeriesConfig>} series - Configuración de series
 * @property {string} xAxisKey - Key del eje X
 * @property {string} [title] - Título del gráfico
 * @property {number} [height] - Altura en px
 * @property {number} [referenceValue] - Línea de referencia
 * @property {string} [unit] - Unidad de medida
 */

const ComposedChart = ({
  data = [],
  series = [],
  xAxisKey = 'label',
  title,
  height = 350,
  referenceValue,
  unit = '',
}) => {
  if (!data || data.length === 0 || !series.length) {
    return (
      <Card className="p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-400">
          Sin datos disponibles
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].payload[xAxisKey]}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="font-semibold">
              {entry.name}: {formatNumber(entry.value, 0)} {unit}
            </span>
          </p>
        ))}
      </div>
    );
  };

  const renderSeries = (config) => {
    const { key, type, color = '#3b82f6', name } = config;

    switch (type) {
      case 'line':
        return (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            name={name || key}
          />
        );

      case 'bar':
        return (
          <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} name={name || key} />
        );

      case 'area':
        return (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            name={name || key}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-2">
            {series.map((s, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: s.color }}
                ></div>
                {s.name || s.key}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsComposed data={data}>
          <defs>
            {series
              .filter((s) => s.type === 'area')
              .map((s) => (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey={xAxisKey} stroke="#6b7280" style={{ fontSize: '12px' }} />

          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatNumber(value, 0)}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {referenceValue && (
            <ReferenceLine
              y={referenceValue}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{
                value: 'Objetivo',
                position: 'insideTopRight',
                fill: '#6b7280',
                fontSize: 12,
              }}
            />
          )}

          {series.map(renderSeries)}
        </RechartsComposed>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {series.map((s) => {
            const total = data.reduce((sum, item) => sum + (item[s.key] || 0), 0);
            const avg = total / data.length;
            return (
              <div key={s.key}>
                <p className="text-gray-600 text-xs">{s.name || s.key}</p>
                <p className="font-semibold" style={{ color: s.color }}>
                  Ø {formatNumber(avg, 0)} {unit}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ComposedChart;
