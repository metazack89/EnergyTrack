import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * @typedef {Object} ConfidenceIntervalProps
 * @property {Array<Object>} data - Datos con intervalos [{fecha, valor, min, max}]
 * @property {number} [confidenceLevel] - Nivel de confianza en % (ej: 95)
 * @property {string} [title] - Título del componente
 * @property {boolean} [showExplanation] - Mostrar explicación educativa
 * @property {Function} [onExport] - Callback para exportar datos
 */

/**
 * Visualización de intervalos de confianza para predicciones
 * Muestra el rango de incertidumbre con métricas estadísticas
 */
const ConfidenceInterval = ({
  data = [],
  confidenceLevel = 95,
  title = 'Intervalo de Confianza',
  showExplanation = true,
  onExport,
}) => {
  // Estado para mostrar/ocultar ayuda
  const [showHelp, setShowHelp] = useState(false);

  /**
   * Calcular estadísticas del intervalo
   */
  const calculateStats = () => {
    if (data.length === 0) return { avgWidth: 0, maxWidth: 0, minWidth: 0, variability: 0 };

    // Ancho del intervalo para cada punto
    const widths = data.map((d) => d.max - d.min);

    // Ancho promedio
    const avgWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;

    // Ancho máximo y mínimo
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);

    // Variabilidad (desviación estándar del ancho)
    const mean = avgWidth;
    const variance = widths.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / widths.length;
    const stdDev = Math.sqrt(variance);

    // Variabilidad como porcentaje del valor promedio
    const avgValue = data.reduce((sum, d) => sum + d.valor, 0) / data.length;
    const variability = (avgWidth / avgValue) * 100;

    return {
      avgWidth,
      maxWidth,
      minWidth,
      stdDev,
      variability,
    };
  };

  const stats = calculateStats();

  /**
   * Determinar nivel de precisión basado en variabilidad
   */
  const getPrecisionLevel = () => {
    if (stats.variability < 10) return { label: 'Muy Alta', color: 'green', icon: '🎯' };
    if (stats.variability < 20) return { label: 'Alta', color: 'blue', icon: '✓' };
    if (stats.variability < 35) return { label: 'Media', color: 'yellow', icon: '⚠' };
    return { label: 'Baja', color: 'red', icon: '⚡' };
  };

  const precision = getPrecisionLevel();

  /**
   * Tooltip personalizado con información detallada
   */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const intervalWidth = data.max - data.min;

    return (
      <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-xl p-4">
        <p className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">{data.fecha}</p>

        <div className="space-y-2 text-sm">
          {/* Valor predicho */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Predicción:</span>
            <span className="font-bold text-purple-600">{formatNumber(data.valor, 0)} kWh</span>
          </div>

          {/* Rango superior */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Límite superior:</span>
            <span className="font-semibold text-indigo-600">{formatNumber(data.max, 0)} kWh</span>
          </div>

          {/* Rango inferior */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Límite inferior:</span>
            <span className="font-semibold text-indigo-600">{formatNumber(data.min, 0)} kWh</span>
          </div>

          {/* Ancho del intervalo */}
          <div className="pt-2 mt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ancho intervalo:</span>
              <Badge className="bg-indigo-100 text-indigo-800">
                ±{formatNumber(intervalWidth / 2, 0)} kWh
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Nivel de confianza: {confidenceLevel}%</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {title}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                Nivel: {confidenceLevel}%
              </Badge>
              <Badge className={`bg-${precision.color}-100 text-${precision.color}-800 text-xs`}>
                {precision.icon} Precisión: {precision.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            Exportar Datos
          </Button>
        )}
      </div>

      {/* Explicación educativa */}
      {showExplanation && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: showHelp ? 'auto' : 0, opacity: showHelp ? 1 : 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-indigo-900 mb-2">
                  ¿Qué es el intervalo de confianza?
                </p>
                <p className="text-indigo-800 mb-3">
                  El intervalo de confianza representa el rango dentro del cual esperamos que se
                  encuentre el valor real con un <strong>{confidenceLevel}% de certeza</strong>.
                </p>
                <ul className="space-y-1 text-indigo-700 text-xs">
                  <li>
                    • <strong>Intervalo estrecho:</strong> Mayor precisión en la predicción
                  </li>
                  <li>
                    • <strong>Intervalo amplio:</strong> Mayor incertidumbre
                  </li>
                  <li>
                    • <strong>Valor central:</strong> Predicción más probable
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gráfico principal */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {/* Definir gradientes */}
            <defs>
              <linearGradient id="intervalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
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

            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />

            {/* Línea de referencia (promedio) */}
            <ReferenceLine
              y={data.reduce((sum, d) => sum + d.valor, 0) / data.length}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{
                value: 'Promedio',
                position: 'insideTopRight',
                fill: '#6b7280',
                fontSize: 11,
              }}
            />

            {/* Área del intervalo superior (relleno) */}
            <Area
              type="monotone"
              dataKey="max"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#intervalGradient)"
              fillOpacity={1}
              name={`Límite superior (${confidenceLevel}%)`}
            />

            {/* Área del intervalo inferior (fondo blanco) */}
            <Area
              type="monotone"
              dataKey="min"
              stroke="#6366f1"
              strokeWidth={2}
              fill="#fff"
              name={`Límite inferior (${confidenceLevel}%)`}
            />

            {/* Línea de predicción central */}
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#8b5cf6"
              strokeWidth={4}
              fill="none"
              dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              name="Predicción"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas del intervalo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
        {/* Ancho promedio */}
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Ancho Promedio</p>
          <p className="text-2xl font-bold text-indigo-600">{formatNumber(stats.avgWidth, 0)}</p>
          <p className="text-xs text-gray-500">kWh</p>
        </div>

        {/* Variabilidad */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Variabilidad</p>
          <p className="text-2xl font-bold text-blue-600">±{formatNumber(stats.variability, 1)}%</p>
          <p className="text-xs text-gray-500">del promedio</p>
        </div>

        {/* Confianza */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Nivel Confianza</p>
          <p className="text-2xl font-bold text-purple-600">{confidenceLevel}%</p>
          <p className="text-xs text-gray-500">certeza</p>
        </div>

        {/* Rango */}
        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-red-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Rango Total</p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(stats.minWidth, 0)} - {formatNumber(stats.maxWidth, 0)}
          </p>
          <p className="text-xs text-gray-500">kWh ancho</p>
        </div>
      </div>

      {/* Alerta de precisión */}
      {precision.color === 'red' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-900 mb-1">Baja Precisión Detectada</p>
            <p className="text-red-800">
              El intervalo de confianza es amplio ({formatNumber(stats.variability, 1)}% de
              variabilidad). Considera recopilar más datos históricos o ajustar el modelo para
              mejorar la precisión.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ConfidenceInterval;
