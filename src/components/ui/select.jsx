import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

/**
 * Componente Select nativo mejorado
 * Select estilizado con icono y estados
 *
 * @param {Object} props - Propiedades del select
 * @param {Array} props.options - Opciones del select [{value, label}]
 * @param {string} [props.placeholder] - Placeholder
 * @param {boolean} [props.error] - Si tiene error
 *
 * @example
 * <Select
 *   options={[
 *     { value: '1', label: 'Opción 1' },
 *     { value: '2', label: 'Opción 2' }
 *   ]}
 *   placeholder="Selecciona..."
 * />
 */
const Select = React.forwardRef(
  ({ className, options = [], placeholder, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            // Estilos base
            'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            // Padding para el icono
            'pr-10',
            // Estados focus
            'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            // Estado disabled
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Estado error
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>

        {/* Icono chevron */}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
