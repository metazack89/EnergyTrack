import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

/**
 * Progress - Barra de progreso
 *
 * @param {Object} props
 * @param {number} [props.value] - Valor del progreso (0-100)
 * @param {string} [props.variant] - Variante de color
 * @param {boolean} [props.showLabel] - Mostrar etiqueta con porcentaje
 *
 * @example
 * <Progress value={60} variant="success" showLabel />
 * <Progress value={30} variant="warning" />
 */
const Progress = React.forwardRef(
  ({ className, value, variant = 'default', showLabel = false, ...props }, ref) => {
    /**
     * Variantes de color para la barra
     */
    const variants = {
      default: 'bg-primary-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      danger: 'bg-red-600',
      info: 'bg-blue-600',
    };

    return (
      <div className="w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-200', className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn('h-full w-full flex-1 transition-all duration-300', variants[variant])}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>

        {/* Etiqueta con porcentaje */}
        {showLabel && <div className="mt-1 text-xs text-gray-600 text-right">{value}%</div>}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * ProgressCircular - Barra de progreso circular
 *
 * @param {Object} props
 * @param {number} props.value - Valor del progreso (0-100)
 * @param {number} [props.size] - Tamaño del círculo
 * @param {number} [props.strokeWidth] - Grosor de la línea
 */
const ProgressCircular = ({ value = 0, size = 120, strokeWidth = 8, className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-gray-200"
          fill="none"
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-primary-600 transition-all duration-300"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Texto central */}
      <div className="absolute text-2xl font-bold text-gray-900">{Math.round(value)}%</div>
    </div>
  );
};

export { Progress, ProgressCircular };
