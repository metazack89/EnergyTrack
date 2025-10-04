import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

/**
 * @typedef {Object} TrendIndicatorProps
 * @property {number} value - Valor del cambio (%)
 * @property {string} [label] - Etiqueta descriptiva
 * @property {boolean} [inverse] - Invertir colores (verde para negativo)
 * @property {string} [size] - Tamaño: 'sm' | 'md' | 'lg'
 * @property {boolean} [showIcon] - Mostrar icono
 * @property {number} [threshold] - Umbral de alerta
 */

const TrendIndicator = ({
  value,
  label,
  inverse = false,
  size = 'md',
  showIcon = true,
  threshold,
}) => {
  const getDirection = () => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  const getColor = () => {
    const direction = getDirection();
    if (direction === 'neutral') return 'gray';

    // Si inverse=true, positivo es malo (rojo) y negativo es bueno (verde)
    if (inverse) {
      return direction === 'up' ? 'red' : 'green';
    }
    return direction === 'up' ? 'green' : 'red';
  };

  const getIcon = () => {
    const direction = getDirection();
    if (direction === 'up') return TrendingUp;
    if (direction === 'down') return TrendingDown;
    return Minus;
  };

  const hasAlert = threshold && Math.abs(value) >= threshold;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const colorClasses = {
    red: 'bg-red-100 text-red-800 border-red-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const color = getColor();
  const Icon = getIcon();

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`${colorClasses[hasAlert ? 'orange' : color]} ${
          sizeClasses[size]
        } font-semibold`}
      >
        {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
        {value > 0 ? '+' : ''}
        {formatNumber(value, 1)}%
      </Badge>

      {label && <span className={`${sizeClasses[size]} text-gray-600`}>{label}</span>}

      {hasAlert && <AlertTriangle className={`${iconSizes[size]} text-orange-600`} />}
    </div>
  );
};

export default TrendIndicator;
