import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  TrendingDown,
  Zap,
  Users,
  Building,
  DollarSign,
  Calendar,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {Object} Recommendation
 * @property {string} id - ID único de la recomendación
 * @property {string} title - Título descriptivo
 * @property {string} description - Descripción detallada
 * @property {string} priority - Nivel de prioridad: 'high' | 'medium' | 'low'
 * @property {string} category - Categoría: 'Eficiencia' | 'Infraestructura' | 'Comportamiento' | 'Optimización'
 * @property {number} [estimatedSavings] - Ahorro estimado en kWh/mes
 * @property {number} [costEstimate] - Costo de implementación en COP
 * @property {string} [timeframe] - Tiempo estimado de implementación
 * @property {Array<string>} [steps] - Pasos para implementar
 */

/**
 * Lista interactiva de recomendaciones basadas en IA
 * Permite visualizar, filtrar y gestionar sugerencias de optimización energética
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array<Recommendation>} props.recommendations - Lista de recomendaciones
 * @param {Function} [props.onImplement] - Callback al marcar como implementada
 * @param {Function} [props.onDismiss] - Callback al descartar recomendación
 */
const RecommendationList = ({ recommendations = [], onImplement, onDismiss }) => {
  // Estado para controlar qué recomendación está expandida
  const [expandedId, setExpandedId] = useState(null);

  // Estados para tracking de acciones del usuario
  const [implementedIds, setImplementedIds] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  /**
   * Configuración visual para cada nivel de prioridad
   * Define colores, iconos y estilos según la urgencia
   */
  const PRIORITY_CONFIG = {
    high: {
      label: 'Alta',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      badgeColor: 'bg-red-100 text-red-800',
    },
    medium: {
      label: 'Media',
      icon: Info,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    low: {
      label: 'Baja',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      badgeColor: 'bg-green-100 text-green-800',
    },
  };

  /**
   * Iconos asociados a cada categoría de recomendación
   */
  const CATEGORY_ICONS = {
    Eficiencia: Zap,
    Infraestructura: Building,
    Comportamiento: Users,
    Optimización: TrendingDown,
  };

  /**
   * Filtrar recomendaciones activas (no implementadas ni descartadas)
   */
  const activeRecommendations = recommendations.filter(
    (r) => !implementedIds.includes(r.id) && !dismissedIds.includes(r.id)
  );

  /**
   * Calcular impacto total de todas las recomendaciones activas
   */
  const totalImpact = {
    savings: activeRecommendations.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0),
    cost: activeRecommendations.reduce((sum, r) => sum + (r.costEstimate || 0), 0),
  };

  /**
   * Manejar la implementación de una recomendación
   * Agrega el ID a la lista de implementadas y ejecuta callback
   */
  const handleImplement = (id) => {
    setImplementedIds((prev) => [...prev, id]);
    onImplement?.(id);
  };

  /**
   * Manejar el descarte de una recomendación
   * Agrega el ID a la lista de descartadas y ejecuta callback
   */
  const handleDismiss = (id) => {
    setDismissedIds((prev) => [...prev, id]);
    onDismiss?.(id);
  };

  /**
   * Toggle expansión de pasos de implementación
   */
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  /**
   * Calcular meses de recuperación de inversión (ROI)
   * Basado en ahorro mensual vs costo de implementación
   */
  const calculateROI = (savings, cost) => {
    if (!savings || !cost) return null;
    // Asumiendo precio promedio de 800 COP/kWh
    const monthlySavings = savings * 800;
    return Math.round(cost / monthlySavings);
  };

  return (
    <Card className="p-6">
      {/* ========== HEADER ========== */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Icono principal */}
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recomendaciones Inteligentes</h3>
            <p className="text-sm text-gray-600">
              {activeRecommendations.length} sugerencias generadas por IA
            </p>
          </div>
        </div>

        {/* Badge de urgencia si hay recomendaciones de alta prioridad */}
        {activeRecommendations.some((r) => r.priority === 'high') && (
          <Badge className="bg-red-100 text-red-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {activeRecommendations.filter((r) => r.priority === 'high').length} urgentes
          </Badge>
        )}
      </div>

      {/* ========== RESUMEN DE IMPACTO ========== */}
      {totalImpact.savings > 0 && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            Impacto Total Estimado
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Ahorro potencial */}
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Ahorro Potencial</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(totalImpact.savings, 0)}
              </p>
              <p className="text-xs text-gray-500">kWh/mes</p>
            </div>
            {/* Inversión total */}
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Inversión Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${formatNumber(totalImpact.cost, 0)}
              </p>
              <p className="text-xs text-gray-500">COP</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== LISTA DE RECOMENDACIONES ========== */}
      <div className="space-y-4">
        {activeRecommendations.length === 0 ? (
          // Estado vacío
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay recomendaciones disponibles</p>
            {(implementedIds.length > 0 || dismissedIds.length > 0) && (
              <p className="text-sm text-gray-400 mt-2">
                {implementedIds.length} implementadas • {dismissedIds.length} descartadas
              </p>
            )}
          </div>
        ) : (
          // Lista con animaciones
          <AnimatePresence>
            {activeRecommendations.map((rec, index) => {
              const priority = PRIORITY_CONFIG[rec.priority];
              const CategoryIcon = CATEGORY_ICONS[rec.category] || TrendingDown;
              const PriorityIcon = priority.icon;
              const isExpanded = expandedId === rec.id;
              const roi = calculateROI(rec.estimatedSavings, rec.costEstimate);

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-2 ${priority.borderColor} ${priority.bgColor} p-4`}>
                    <div className="flex gap-4">
                      {/* ===== ICONO DE CATEGORÍA ===== */}
                      <div className="p-3 bg-white rounded-xl shadow-sm flex-shrink-0">
                        <CategoryIcon className="w-6 h-6 text-blue-600" />
                      </div>

                      {/* ===== CONTENIDO ===== */}
                      <div className="flex-1 min-w-0">
                        {/* Título y badges */}
                        <div className="mb-3">
                          <h4 className="font-bold text-gray-900 mb-2">{rec.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={priority.badgeColor}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {priority.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-sm text-gray-700 mb-4">{rec.description}</p>

                        {/* ===== MÉTRICAS ===== */}
                        {(rec.estimatedSavings || rec.costEstimate || rec.timeframe) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {/* Ahorro */}
                            {rec.estimatedSavings && (
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                  <TrendingDown className="w-3 h-3" />
                                  Ahorro
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                  {formatNumber(rec.estimatedSavings, 0)}
                                </p>
                                <p className="text-xs text-gray-500">kWh/mes</p>
                              </div>
                            )}

                            {/* Costo */}
                            {rec.costEstimate && (
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                  <DollarSign className="w-3 h-3" />
                                  Costo
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  ${formatNumber(rec.costEstimate, 0)}
                                </p>
                                <p className="text-xs text-gray-500">COP</p>
                              </div>
                            )}

                            {/* Plazo */}
                            {rec.timeframe && (
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                  <Calendar className="w-3 h-3" />
                                  Plazo
                                </p>
                                <p className="text-sm font-bold">{rec.timeframe}</p>
                              </div>
                            )}

                            {/* ROI */}
                            {roi && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <p className="text-xs text-blue-700 mb-1 font-medium">ROI</p>
                                <p className="text-lg font-bold text-blue-900">{roi}</p>
                                <p className="text-xs text-blue-600">meses</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ===== PASOS EXPANDIBLES ===== */}
                        {rec.steps && rec.steps.length > 0 && (
                          <div className="mb-4">
                            <button
                              onClick={() => toggleExpand(rec.id)}
                              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              {isExpanded ? 'Ocultar' : 'Ver'} pasos ({rec.steps.length})
                              <ArrowRight
                                className={`w-4 h-4 transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-3"
                                >
                                  <div className="bg-white rounded-lg p-4 border">
                                    <ol className="space-y-2">
                                      {rec.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-sm">
                                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
                                            {i + 1}
                                          </span>
                                          <span className="text-gray-700 pt-0.5">{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* ===== ACCIONES ===== */}
                        <div className="flex gap-2 pt-3 border-t">
                          {onImplement && (
                            <Button
                              size="sm"
                              onClick={() => handleImplement(rec.id)}
                              className="flex-1"
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Implementar
                            </Button>
                          )}
                          {onDismiss && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismiss(rec.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Descartar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ========== FOOTER - ESTADÍSTICAS ========== */}
      {(implementedIds.length > 0 || dismissedIds.length > 0) && (
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex gap-4">
            {implementedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  <strong className="text-green-600">{implementedIds.length}</strong> implementadas
                </span>
              </div>
            )}
            {dismissedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  <strong>{dismissedIds.length}</strong> descartadas
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecommendationList;
