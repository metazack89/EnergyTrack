import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
} from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} PredictionCardProps
 * @property {Object} prediction - Datos de la predicción
 * @property {string} [municipio] - Nombre del municipio
 * @property {Function} [onViewDetails] - Callback para ver detalles
 * @property {Function} [onDelete] - Callback para eliminar
 */

/**
 * Tarjeta compacta con resumen de predicción
 * Muestra métricas clave y estado de confianza
 */
const PredictionCard = ({ prediction, municipio, onViewDetails, onDelete }) => {
  /**
   * Calcular métricas de la predicción
   */
  const valores = prediction.valores_predichos || [];
  const promedio = valores.length > 0 ? valores.reduce((sum, v) => sum + v, 0) / valores.length : 0;

  const tendencia =
    valores.length >= 2 ? ((valores[valores.length - 1] - valores[0]) / valores[0]) * 100 : 0;

  /**
   * Determinar nivel de confianza basado en precisión (MAE)
   * Menor MAE = Mayor confianza
   */
  const getConfidenceLevel = (precision) => {
    if (!precision) return { label: 'Desconocida', color: 'gray', icon: AlertTriangle };
    if (precision < 1000) return { label: 'Alta', color: 'green', icon: CheckCircle };
    if (precision < 3000) return { label: 'Media', color: 'yellow', icon: AlertTriangle };
    return { label: 'Baja', color: 'red', icon: AlertTriangle };
  };

  const confidence = getConfidenceLevel(prediction.precision);
  const ConfidenceIcon = confidence.icon;

  /**
   * Calcular fecha estimada de fin de la predicción
   */
  const fechaInicio = new Date(prediction.created_at);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + prediction.meses_predichos);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{municipio || 'Predicción'}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {prediction.meses_predichos} meses proyectados
              </p>
            </div>
          </div>

          {/* Confidence badge */}
          <Badge className={`bg-${confidence.color}-100 text-${confidence.color}-800`}>
            <ConfidenceIcon className="w-3 h-3 mr-1" />
            {confidence.label}
          </Badge>
        </div>

        {/* Main metric */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Consumo Promedio Predicho</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{formatNumber(promedio, 0)}</p>
            <span className="text-sm text-gray-600">kWh/mes</span>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2 mb-4">
          {tendencia > 0 ? (
            <TrendingUp className="w-5 h-5 text-red-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-green-600" />
          )}
          <p className={`text-sm font-medium ${tendencia > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {tendencia > 0 ? '+' : ''}
            {formatNumber(tendencia, 1)}% de tendencia
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
          <div>
            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
              <Target className="w-3 h-3" />
              Precisión (MAE)
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {prediction.precision ? formatNumber(prediction.precision, 0) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" />
              Hasta
            </p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(fechaFin)}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 mb-4">
          <p>Creada: {formatDate(prediction.created_at)}</p>
          {prediction.metadata?.modelo && (
            <p className="mt-1">Modelo: {prediction.metadata.modelo}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button onClick={() => onViewDetails(prediction)} className="flex-1">
              Ver Detalles
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(prediction.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Eliminar
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PredictionCard;
