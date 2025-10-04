import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {Object} ConfirmDialogProps
 * @property {boolean} isOpen - Control de visibilidad del diálogo
 * @property {Function} onClose - Callback al cerrar el diálogo
 * @property {Function} onConfirm - Callback al confirmar acción
 * @property {string} [title] - Título del diálogo
 * @property {string} [message] - Mensaje descriptivo
 * @property {'danger' | 'warning' | 'info'} [variant] - Variante del diálogo
 * @property {string} [confirmLabel] - Texto del botón confirmar
 * @property {string} [cancelLabel] - Texto del botón cancelar
 * @property {boolean} [loading] - Estado de carga durante confirmación
 */

/**
 * Diálogo de confirmación modal con variantes visuales
 * Útil para acciones destructivas o importantes que requieren confirmación
 *
 * @param {ConfirmDialogProps} props - Propiedades del componente
 * @example
 * const [showDialog, setShowDialog] = useState(false)
 *
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleDelete}
 *   title="Eliminar registro"
 *   message="¿Estás seguro? Esta acción no se puede deshacer"
 *   variant="danger"
 * />
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar?',
  variant = 'warning',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}) => {
  /**
   * Configuración visual por variante
   */
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  /**
   * Manejar confirmación
   */
  const handleConfirm = async () => {
    await onConfirm();
    // No cerramos aquí - el componente padre debe controlar onClose
  };

  /**
   * Prevenir cierre durante carga
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  /**
   * Cerrar con tecla Escape
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay de fondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            {/* Card del diálogo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="p-6 relative">
                {/* Botón cerrar */}
                {!loading && (
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}

                {/* Icono de variante */}
                <div className="flex justify-center mb-4">
                  <div className={`p-3 ${config.iconBg} rounded-full`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                  </div>
                </div>

                {/* Título */}
                <h3 id="dialog-title" className="text-xl font-bold text-gray-900 text-center mb-2">
                  {title}
                </h3>

                {/* Mensaje */}
                <p className="text-gray-600 text-center mb-6">{message}</p>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`flex-1 ${config.confirmClass}`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      confirmLabel
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
