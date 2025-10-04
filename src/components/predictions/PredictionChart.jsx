import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Brain, TrendingUp, Calendar, Download } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} PredictionChartProps
 * @property {Array<Object>} historicalData - Datos históricos [{ fecha, valor }]
 * @property {Array<Object>} predictionData - Datos predichos [{ fecha, valor, min, max }]
 * @property {string} [title] - Título del gráfico
 * @property {string} [unit] - Unidad de medida
 * @property {number} [accuracy] - Precisión del modelo (MAE)
 * @property {Function} [onExport] - Callback para exportar
 */

/**
 * Gráfico de predicción con datos históricos y proyecciones futuras
 * Muestra intervalos de confianza y métricas de precisión
 */
const PredictionChart = ({
  historicalData = [],
  predictionData = [],
  title = 'Predicción de Consumo',
  unit = 'kWh',
  accuracy = 0,
  onExport,
}) => {
  // Estado para controlar visualización
  const [showConfidence, setShowConfidence] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);

  /**
   * Combinar datos históricos y predichos para el gráfico
   * Marcar punto de división entre pasado y futuro
   */
  const combinedData = [
    ...historicalData.map((d) => ({
      fecha: d.fecha,
      historico: d.valor,
      tipo: 'histórico',
    })),
    // Último dato histórico también en predicción para continuidad
    {
      fecha: historicalData[historicalData.length - 1]?.fecha,
      historico: historicalData[historicalData.length - 1]?.valor,
      prediccion: historicalData[historicalData.length - 1]?.valor,
      tipo: 'transición',
    },
    ...predictionData.map((d) => ({
      fecha: d.fecha,
      prediccion: d.valor,
      min: d.min,
      max: d.max,
      tipo: 'predicción',
    })),
  ];

  /**
   * Calcular estadísticas de la predicción
   */
  const stats = {
    avgPrediction:
      predictionData.length > 0
        ? predictionData.reduce((sum, d) => sum + d.valor, 0) / predictionData.length
        : 0,
    minPrediction: predictionData.length > 0 ? Math.min(...predictionData.map((d) => d.valor)) : 0,
    maxPrediction: predictionData.length > 0 ? Math.max(...predictionData.map((d) => d.valor)) : 0,
    avgHistorical:
      historicalData.length > 0
        ? historicalData.reduce((sum, d) => sum + d.valor, 0) / historicalData.length
        : 0,
  };

  /**
   * Calcular tendencia (crecimiento o decrecimiento)
   */
  const trend =
    stats.avgPrediction > stats.avgHistorical
      ? {
          direction: 'up',
          value: ((stats.avgPrediction - stats.avgHistorical) / stats.avgHistorical) * 100,
        }
      : {
          direction: 'down',
          value: ((stats.avgHistorical - stats.avgPrediction) / stats.avgHistorical) * 100,
        };

  /**
   * Tooltip personalizado con información detallada
   */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isHistorical = data.tipo === 'histórico';

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">{data.fecha}</p>

        {isHistorical ? (
          <div className="text-sm">
            <p className="text-blue-600 font-medium">
              Histórico: {formatNumber(data.historico, 0)} {unit}
            </p>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p className="text-purple-600 font-medium">
              Predicción: {formatNumber(data.prediccion, 0)} {unit}
            </p>
            {showConfidence && data.min && data.max && (
              <>
                <p className="text-gray-600 text-xs">
                  Mínimo: {formatNumber(data.min, 0)} {unit}
                </p>
                <p className="text-gray-600 text-xs">
                  Máximo: {formatNumber(data.max, 0)} {unit}
                </p>
                <p className="text-gray-500 text-xs mt-1">Intervalo de confianza 95%</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                MAE: {formatNumber(accuracy, 2)}
              </Badge>
              <Badge
                className={`text-xs ${
                  trend.direction === 'up'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <TrendingUp
                  className={`w-3 h-3 mr-1 ${trend.direction === 'down' ? 'rotate-180' : ''}`}
                />
                {trend.direction === 'up' ? '+' : '-'}
                {formatNumber(Math.abs(trend.value), 1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistorical(!showHistorical)}>
            {showHistorical ? '✓' : ''} Histórico
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowConfidence(!showConfidence)}>
            {showConfidence ? '✓' : ''} Intervalo
          </Button>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {/* Gradiente para área de confianza */}
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey="fecha" stroke="#6b7280" style={{ fontSize: '12px' }} />

          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatNumber(value, 0)}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />

          {/* Línea de referencia en el punto de división */}
          <ReferenceLine
            x={historicalData[historicalData.length - 1]?.fecha}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{
              value: 'Predicción →',
              position: 'insideTopRight',
              fill: '#6b7280',
              fontSize: 12,
            }}
          />

          {/* Área de intervalo de confianza */}
          {showConfidence && (
            <Area
              type="monotone"
              dataKey="max"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
              name="Intervalo de confianza"
            />
          )}

          {/* Línea histórica */}
          {showHistorical && (
            <Line
              type="monotone"
              dataKey="historico"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Datos históricos"
            />
          )}

          {/* Línea de predicción */}
          <Line
            type="monotone"
            dataKey="prediccion"
            stroke="#a855f7"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#a855f7', r: 5 }}
            name="Predicción"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-xs text-gray-600 mb-1">Promedio Histórico</p>
          <p className="text-lg font-bold text-blue-600">
            {formatNumber(stats.avgHistorical, 0)} {unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Promedio Predicho</p>
          <p className="text-lg font-bold text-purple-600">
            {formatNumber(stats.avgPrediction, 0)} {unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Rango Predicción</p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(stats.minPrediction, 0)} - {formatNumber(stats.maxPrediction, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Meses Proyectados</p>
          <p className="text-lg font-bold text-gray-900">{predictionData.length}</p>
        </div>
      </div>
    </Card>
  );
};

export default PredictionChart;
