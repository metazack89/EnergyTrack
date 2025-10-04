import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} RadarChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {Array<string>} dataKeys - Keys de las métricas
 * @property {string} categoryKey - Key de la categoría
 * @property {string} [title] - Título del gráfico
 * @property {Array<string>} [colors] - Colores por serie
 * @property {number} [height] - Altura en px
 */

const RadarChart = ({
  data = [],
  dataKeys = [],
  categoryKey = 'category',
  title,
  colors = ['#3b82f6', '#10b981', '#f59e0b'],
  height = 300,
}) => {
  if (!data || data.length === 0 || dataKeys.length === 0) {
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].payload[categoryKey]}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value, 0)}
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
        <RechartsRadar data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey={categoryKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </RechartsRadar>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 text-center mt-4">
        Valores normalizados (0-100). Mayor área = mejor desempeño
      </p>
    </Card>
  );
};

export default RadarChart;
