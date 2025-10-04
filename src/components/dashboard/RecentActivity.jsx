import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, FileText, Zap, Brain, Edit, Plus, Trash } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} ActivityItem
 * @property {string} id - ID de la actividad
 * @property {string} type - Tipo de actividad
 * @property {string} description - Descripción
 * @property {string} user - Usuario que realizó la acción
 * @property {Date} timestamp - Fecha y hora
 * @property {Object} [metadata] - Información adicional
 */

/**
 * @typedef {Object} RecentActivityProps
 * @property {Array<ActivityItem>} activities - Lista de actividades
 * @property {number} [limit] - Máximo de items a mostrar
 * @property {boolean} [loading] - Estado de carga
 */

const RecentActivity = ({ activities = [], limit = 10, loading = false }) => {
  const activityConfig = {
    'consumo.created': {
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Nuevo consumo',
    },
    'consumo.updated': {
      icon: Edit,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Consumo actualizado',
    },
    'consumo.deleted': {
      icon: Trash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Consumo eliminado',
    },
    'prediccion.created': {
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Predicción generada',
    },
    'reporte.created': {
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Reporte creado',
    },
    'user.login': {
      icon: User,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Inicio de sesión',
    },
    default: {
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Actividad',
    },
  };

  const displayedActivities = activities.slice(0, limit);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (displayedActivities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay actividad reciente</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
        <Badge variant="outline">{displayedActivities.length} eventos</Badge>
      </div>

      <div className="space-y-3">
        {displayedActivities.map((activity, index) => {
          const config = activityConfig[activity.type] || activityConfig.default;
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 ${config.bgColor} rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <Badge className="text-xs flex-shrink-0">{config.label}</Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{activity.user || 'Sistema'}</span>
                  <span>•</span>
                  <span>{formatDate(activity.timestamp)}</span>
                </div>

                {activity.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: <strong>{value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {activities.length > limit && (
        <div className="mt-4 pt-4 border-t text-center">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todas las actividades ({activities.length})
          </button>
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
