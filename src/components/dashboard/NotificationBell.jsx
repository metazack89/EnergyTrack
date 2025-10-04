import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';

/**
 * @typedef {Object} Notification
 * @property {string} id - ID de la notificación
 * @property {string} type - Tipo: 'info' | 'warning' | 'error' | 'success'
 * @property {string} title - Título
 * @property {string} message - Mensaje
 * @property {Date} timestamp - Fecha y hora
 * @property {boolean} read - Si fue leída
 */

/**
 * @typedef {Object} NotificationBellProps
 * @property {Array<Notification>} notifications - Lista de notificaciones
 * @property {Function} [onMarkAsRead] - Callback al marcar como leída
 * @property {Function} [onMarkAllAsRead] - Callback al marcar todas
 * @property {Function} [onDelete] - Callback al eliminar
 */

const NotificationBell = ({ notifications = [], onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const notificationConfig = {
    info: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  };

  const handleMarkAsRead = (id) => {
    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleDelete = (id) => {
    onDelete?.(id);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-96 z-50"
            >
              <Card className="shadow-xl max-h-[32rem] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{unreadCount} sin leer</p>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => {
                        const config = notificationConfig[notification.type];
                        const Icon = config.icon;

                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`p-2 ${config.bgColor} rounded-lg flex-shrink-0 h-fit`}
                              >
                                <Icon className={`w-4 h-4 ${config.color}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {formatDate(notification.timestamp)}
                                  </span>

                                  <div className="flex gap-1">
                                    {!notification.read && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        title="Marcar como leída"
                                      >
                                        <Check className="w-4 h-4 text-gray-600" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(notification.id)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Eliminar"
                                    >
                                      <X className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-gray-50 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
