import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Variantes de estilos para el botón usando CVA
 * Define todos los estados visuales posibles
 */
const buttonVariants = cva(
  // Estilos base aplicados a todas las variantes
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // Variantes de color/estilo
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      // Tamaños
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    // Valores por defecto
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Componente Button reutilizable
 * Basado en shadcn/ui con soporte para variantes y tamaños
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.variant] - Variante de estilo
 * @param {string} [props.size] - Tamaño del botón
 * @param {boolean} [props.asChild] - Renderizar como componente hijo
 * @param {string} [props.className] - Clases CSS adicionales
 *
 * @example
 * <Button variant="default" size="lg">Click me</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="destructive">Delete</Button>
 */
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
