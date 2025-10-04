import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Componente Input reutilizable
 * Input estilizado con estados focus, disabled, error
 *
 * @param {Object} props - Propiedades del input
 * @param {string} [props.type] - Tipo de input (text, email, password, etc)
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {boolean} [props.error] - Si el input tiene error
 *
 * @example
 * <Input type="email" placeholder="correo@ejemplo.com" />
 * <Input type="password" error={true} />
 */
const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Estilos base
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        // Estados focus
        'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        // Estado disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Placeholder
        'placeholder:text-gray-400',
        // Estado de error
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
