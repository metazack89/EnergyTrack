import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} AreaChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {Array<string>|string} dataKeys - Key(s) del valor Y
 * @property {string} xAxisKey - Key del valor X
 * @property {string} [title] - Título del gráfico
 * @property {Array<string>} [colors] - Colores de las áreas
 * @property {number} [height] - Altura en px
 * @property {boolean} [stacked] - Áreas apiladas
 * @property {string} [unit] - Unidad de medida
 */

const AreaChart = ({
  data = [],
  dataKeys = 'value',
  xAxisKey = 'label',
  title,
  colors = ['#3b82f6', '#10b981', '#f59e0b'],
  height = 300,
  stacked = false,
  unit = '',
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

  const keys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].payload[xAxisKey]}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value, 0)} {unit}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsArea data={data}>
          <defs>
            {keys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
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

          {keys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={`url(#gradient-${key})`}
              fillOpacity={1}
              strokeWidth={2}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsArea>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          Total acumulado:{' '}
          {formatNumber(
            data.reduce(
              (sum, item) => sum + keys.reduce((keySum, key) => keySum + (item[key] || 0), 0),
              0
            ),
            0
          )}{' '}
          {unit}
        </div>
      )}
    </Card>
  );
};

export default AreaChart;
