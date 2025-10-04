import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Variantes de Alert
 */
const alertVariants = cva('relative w-full rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'bg-white border-gray-200 text-gray-900',
      destructive: 'bg-red-50 border-red-200 text-red-900',
      success: 'bg-green-50 border-green-200 text-green-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * Iconos por variante
 */
const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Alert - Contenedor principal
 */
const Alert = React.forwardRef(({ className, variant, showIcon = true, ...props }, ref) => {
  const Icon = variantIcons[variant] || variantIcons.default;

  return (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {showIcon && (
        <div className="absolute left-4 top-4">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className={showIcon ? 'pl-7' : ''}>{props.children}</div>
    </div>
  );
});
Alert.displayName = 'Alert';

/**
 * AlertTitle - Título del alert
 */
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

/**
 * AlertDescription - Descripción del alert
 */
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
