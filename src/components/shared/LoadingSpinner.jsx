import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {'sm' | 'md' | 'lg' | 'xl'} [size] - Tamaño del spinner
 * @property {string} [message] - Mensaje de carga
 * @property {boolean} [fullScreen] - Si ocupa toda la pantalla
 * @property {'default' | 'branded'} [variant] - Variante del spinner
 */

/**
 * Spinner de carga reutilizable con múltiples variantes
 * Soporta diferentes tamaños y puede mostrarse en pantalla completa
 *
 * @param {LoadingSpinnerProps} props - Propiedades del componente
 * @example
 * <LoadingSpinner size="lg" message="Cargando datos..." fullScreen />
 */
const LoadingSpinner = ({
  size = 'md',
  message = 'Cargando...',
  fullScreen = false,
  variant = 'default',
}) => {
  /**
   * Configuración de tamaños para el spinner
   */
  const sizeConfig = {
    sm: { spinner: 'w-4 h-4', text: 'text-xs', icon: 16 },
    md: { spinner: 'w-8 h-8', text: 'text-sm', icon: 24 },
    lg: { spinner: 'w-12 h-12', text: 'text-base', icon: 32 },
    xl: { spinner: 'w-16 h-16', text: 'text-lg', icon: 40 },
  };

  const config = sizeConfig[size];

  /**
   * Renderizar spinner con variante branded (logo EnergyTrack)
   */
  const BrandedSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="relative"
    >
      <div
        className={`${config.spinner} bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center`}
      >
        <Zap className="text-white" size={config.icon * 0.6} />
      </div>
    </motion.div>
  );

  /**
   * Renderizar spinner por defecto (icono de carga)
   */
  const DefaultSpinner = () => (
    <Loader2 className={`${config.spinner} animate-spin text-primary-600`} />
  );

  /**
   * Contenedor del spinner
   */
  const SpinnerContainer = ({ children }) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">{children}</div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">{children}</div>
      </div>
    );
  };

  return (
    <SpinnerContainer>
      {/* Spinner animado */}
      {variant === 'branded' ? <BrandedSpinner /> : <DefaultSpinner />}

      {/* Mensaje de carga */}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 ${config.text} text-gray-600 font-medium`}
        >
          {message}
        </motion.p>
      )}

      {/* Puntos animados */}
      <div className="flex gap-1 justify-center mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
