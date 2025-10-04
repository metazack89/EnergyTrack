import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap, MapPin, Users } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} QuickStatsProps
 * @property {Object} stats - Objeto con estadísticas
 * @property {boolean} [loading] - Estado de carga
 */

const QuickStats = ({ stats = {}, loading = false }) => {
  const defaultStats = [
    {
      key: 'total',
      label: 'Consumo Total',
      value: stats.total || 0,
      unit: 'kWh',
      icon: Zap,
      color: 'blue',
      change: stats.totalChange || 0,
    },
    {
      key: 'average',
      label: 'Promedio Diario',
      value: stats.average || 0,
      unit: 'kWh',
      icon: Activity,
      color: 'green',
      change: stats.averageChange || 0,
    },
    {
      key: 'municipios',
      label: 'Municipios Activos',
      value: stats.municipios || 0,
      unit: '',
      icon: MapPin,
      color: 'purple',
    },
    {
      key: 'usuarios',
      label: 'Usuarios',
      value: stats.usuarios || 0,
      unit: '',
      icon: Users,
      color: 'orange',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {defaultStats.map((stat, index) => {
        const Icon = stat.icon;
        const hasChange = stat.change !== undefined && stat.change !== null;
        const isPositive = hasChange && stat.change >= 0;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                <div className={`p-1.5 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                </div>
              </div>

              <div className="mb-2">
                <h4 className="text-2xl font-bold text-gray-900">
                  {formatNumber(stat.value, 0)}
                  {stat.unit && <span className="text-sm text-gray-600 ml-1">{stat.unit}</span>}
                </h4>
              </div>

              {hasChange && (
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-600" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      isPositive ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatNumber(stat.change, 1)}%
                  </span>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;
