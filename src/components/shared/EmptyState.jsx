import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, Inbox, Search, Database, Zap, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} EmptyStateProps
 * @property {'no-data' | 'no-results' | 'no-items' | 'error'} [type] - Tipo de estado vacío
 * @property {string} [title] - Título personalizado
 * @property {string} [description] - Descripción personalizada
 * @property {string} [actionLabel] - Texto del botón de acción
 * @property {Function} [onAction] - Callback para acción principal
 * @property {boolean} [showIcon] - Mostrar icono
 */

/**
 * Componente para mostrar estados vacíos con estilo
 * Proporciona feedback visual cuando no hay datos
 *
 * @param {EmptyStateProps} props - Propiedades del componente
 * @example
 * <EmptyState
 *   type="no-data"
 *   actionLabel="Crear Registro"
 *   onAction={() => navigate('/nuevo')}
 * />
 */
const EmptyState = ({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  showIcon = true,
}) => {
  /**
   * Configuración por tipo de estado vacío
   */
  const configs = {
    'no-data': {
      icon: Database,
      defaultTitle: 'No hay datos disponibles',
      defaultDescription: 'Aún no se han registrado datos en el sistema',
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
    },
    'no-results': {
      icon: Search,
      defaultTitle: 'No se encontraron resultados',
      defaultDescription: 'Intenta ajustar los filtros de búsqueda',
      color: 'text-blue-400',
      bgColor: 'bg-blue-100',
    },
    'no-items': {
      icon: Inbox,
      defaultTitle: 'No hay elementos',
      defaultDescription: 'La lista está vacía. Comienza agregando un nuevo elemento',
      color: 'text-purple-400',
      bgColor: 'bg-purple-100',
    },
    error: {
      icon: FileX,
      defaultTitle: 'Error al cargar datos',
      defaultDescription: 'Ocurrió un problema al obtener la información',
      color: 'text-red-400',
      bgColor: 'bg-red-100',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className="p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Icono animado */}
        {showIcon && (
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`p-6 ${config.bgColor} rounded-full`}
            >
              <Icon className={`w-16 h-16 ${config.color}`} />
            </motion.div>
          </div>
        )}

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title || config.defaultTitle}</h3>

        {/* Descripción */}
        <p className="text-gray-600 mb-6">{description || config.defaultDescription}</p>

        {/* Botón de acción */}
        {onAction && actionLabel && (
          <Button onClick={onAction}>
            {type === 'error' ? (
              <RefreshCw className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {actionLabel}
          </Button>
        )}
      </motion.div>
    </Card>
  );
};

export default EmptyState;
