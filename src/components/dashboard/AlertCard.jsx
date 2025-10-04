import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * @typedef {Object} AlertCardProps
 * @property {string} type - Tipo: 'info' | 'warning' | 'error' | 'success'
 * @property {string} title - Título de la alerta
 * @property {string} message - Mensaje descriptivo
 * @property {boolean} [dismissible] - Puede cerrarse
 * @property {Function} [onDismiss] - Callback al cerrar
 * @property {Function} [onAction] - Callback de acción
 * @property {string} [actionLabel] - Texto del botón de acción
 */

const AlertCard = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  onDismiss,
  onAction,
  actionLabel = 'Ver detalles',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const configs = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      badgeClass: 'bg-blue-100 text-blue-800',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      badgeClass: 'bg-orange-100 text-orange-800',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      badgeClass: 'bg-red-100 text-red-800',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      badgeClass: 'bg-green-100 text-green-800',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`${config.bgColor} border-2 ${config.borderColor} p-4`}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 ${config.iconColor} bg-white rounded-lg flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                  <Badge className={config.badgeClass} size="sm">
                    {type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{message}</p>

                {/* Actions */}
                {onAction && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={onAction} className="text-xs">
                      {actionLabel}
                    </Button>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertCard;
