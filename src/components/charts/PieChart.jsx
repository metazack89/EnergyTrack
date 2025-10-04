import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} PieChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {string} dataKey - Key del valor
 * @property {string} nameKey - Key del nombre
 * @property {string} [title] - Título del gráfico
 * @property {Array<string>} [colors] - Colores personalizados
 * @property {number} [height] - Altura en px
 * @property {boolean} [showLabels] - Mostrar etiquetas
 * @property {boolean} [donut] - Estilo donut (con centro vacío)
 */

const PieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title,
  colors,
  height = 300,
  showLabels = true,
  donut = false,
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

  const COLORS = colors || [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
  ];

  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (!showLabels || percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const percent = (payload[0].value / total) * 100;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-semibold" style={{ color: payload[0].payload.fill }}>
            {formatNumber(payload[0].value, 0)}
          </span>{' '}
          ({percent.toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={height * 0.35}
            innerRadius={donut ? height * 0.2 : 0}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const percent = (entry.payload[dataKey] / total) * 100;
              return `${value} (${percent.toFixed(1)}%)`;
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-700">{item[nameKey]}</span>
              </div>
              <span className="font-semibold">{formatNumber(item[dataKey], 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PieChart;
