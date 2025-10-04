import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} StatCardProps
 * @property {string} title - Título de la estadística
 * @property {number|string} value - Valor principal
 * @property {string} [unit] - Unidad de medida
 * @property {Object} [icon] - Componente de icono
 * @property {number} [change] - Cambio porcentual
 * @property {string} [changeLabel] - Etiqueta del cambio
 * @property {string} [color] - Color del tema
 * @property {boolean} [loading] - Estado de carga
 * @property {Function} [onClick] - Callback al hacer click
 */

const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  change,
  changeLabel = 'vs mes anterior',
  color = 'blue',
  loading = false,
  onClick,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const getTrendIcon = () => {
    if (change === undefined || change === null) return Minus;
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return 'text-gray-500';
    return change >= 0 ? 'text-red-600' : 'text-green-600';
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-6 relative overflow-hidden ${
          onClick ? 'cursor-pointer hover:shadow-lg' : ''
        } transition-shadow`}
        onClick={onClick}
      >
        {/* Background gradient */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}
        ></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {Icon && (
              <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {typeof value === 'number' ? formatNumber(value, 0) : value}
              </h3>
              {unit && <span className="text-sm text-gray-600 font-medium">{unit}</span>}
            </div>
          </div>

          {/* Trend */}
          {change !== undefined && change !== null && (
            <div className="flex items-center gap-2">
              <Badge className={`${getTrendColor()} bg-transparent border-0 px-0`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {change > 0 ? '+' : ''}
                {formatNumber(change, 1)}%
              </Badge>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}

          {/* Link indicator */}
          {onClick && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
