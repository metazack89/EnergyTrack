import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * @typedef {Object} BackButtonProps
 * @property {string} [to] - Ruta específica a navegar (opcional)
 * @property {string} [label] - Texto del botón
 * @property {'outline' | 'ghost' | 'default'} [variant] - Variante del botón
 * @property {Function} [onClick] - Callback personalizado antes de navegar
 */

/**
 * Botón para navegar hacia atrás en el historial
 * Por defecto usa navigate(-1), pero puede especificarse ruta
 *
 * @param {BackButtonProps} props - Propiedades del componente
 * @example
 * // Volver a la página anterior
 * <BackButton />
 *
 * // Ir a ruta específica
 * <BackButton to="/dashboard" label="Volver al Dashboard" />
 */
const BackButton = ({ to, label = 'Volver', variant = 'outline', onClick }) => {
  const navigate = useNavigate();

  /**
   * Manejar click del botón
   */
  const handleClick = () => {
    // Ejecutar callback personalizado si existe
    if (onClick) {
      onClick();
    }

    // Navegar a ruta específica o volver atrás
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button variant={variant} onClick={handleClick} className="gap-2">
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default BackButton;
