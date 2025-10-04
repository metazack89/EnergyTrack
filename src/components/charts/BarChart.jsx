import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} BarChartProps
 * @property {Array<Object>} data - Datos para el gráfico
 * @property {string} dataKey - Key del valor Y
 * @property {string} xAxisKey - Key del valor X
 * @property {string} [title] - Título del gráfico
 * @property {string|Array<string>} [colors] - Color(es) de las barras
 * @property {number} [height] - Altura en px
 * @property {boolean} [horizontal] - Orientación horizontal
 * @property {boolean} [stacked] - Barras apiladas
 * @property {string} [unit] - Unidad de medida
 */

const BarChart = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'label',
  title,
  colors = '#3b82f6',
  height = 300,
  horizontal = false,
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

  const colorArray = Array.isArray(colors) ? colors : [colors];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{payload[0].payload[xAxisKey]}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 mt-1">
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatNumber(entry.value, 0)} {unit}
            </span>
          </p>
        ))}
      </div>
    );
  };

  const ChartComponent = horizontal ? 'BarChart' : RechartsBar;

  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, bottom: horizontal ? 5 : 20, left: horizontal ? 100 : 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke="#6b7280"
                tickFormatter={(value) => formatNumber(value, 0)}
              />
              <YAxis type="category" dataKey={xAxisKey} stroke="#6b7280" width={90} />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                stroke="#6b7280"
                angle={data.length > 8 ? -45 : 0}
                textAnchor={data.length > 8 ? 'end' : 'middle'}
                height={data.length > 8 ? 80 : 30}
              />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatNumber(value, 0)} />
            </>
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {Array.isArray(dataKey) ? (
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colorArray[index] || COLORS[index % COLORS.length]}
                radius={[8, 8, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              />
            ))
          ) : (
            <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorArray[index % colorArray.length] || COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          )}
        </RechartsBar>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          Total:{' '}
          {formatNumber(
            data.reduce(
              (sum, item) =>
                sum +
                (Array.isArray(dataKey)
                  ? dataKey.reduce((s, k) => s + (item[k] || 0), 0)
                  : item[dataKey]),
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

export default BarChart;
