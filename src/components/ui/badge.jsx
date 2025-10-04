import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Variantes de Badge
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-800',
        secondary: 'border-transparent bg-gray-100 text-gray-800',
        destructive: 'border-transparent bg-red-100 text-red-800',
        success: 'border-transparent bg-green-100 text-green-800',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        outline: 'text-gray-700 border-gray-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Componente Badge
 * Etiquetas pequeñas para mostrar estado, categorías, etc.
 *
 * @example
 * <Badge variant="success">Activo</Badge>
 * <Badge variant="destructive">Error</Badge>
 */
function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
