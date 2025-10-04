import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

/**
 * Switch - Interruptor de encendido/apagado
 *
 * @param {Object} props
 * @param {boolean} [props.checked] - Estado del switch
 * @param {Function} [props.onCheckedChange] - Callback al cambiar
 *
 * @example
 * const [enabled, setEnabled] = useState(false)
 *
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 */
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      // Estilos base
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
      'transition-colors',
      // Estados
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Estado checked
      'data-[state=checked]:bg-primary-600',
      'data-[state=unchecked]:bg-gray-200',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // Estilos del thumb (círculo)
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
        // Posición según estado
        'data-[state=checked]:translate-x-5',
        'data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
