import DataTable from './DataTable';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { Sun, Wind, Droplet, Flame, Zap, Edit, Trash2, TrendingUp } from 'lucide-react';

/**
 * @typedef {Object} FuentesTableProps
 * @property {Array<Object>} fuentes - Lista de fuentes energéticas
 * @property {boolean} [loading] - Estado de carga
 * @property {Function} [onEdit] - Editar fuente
 * @property {Function} [onDelete] - Eliminar fuente
 * @property {Function} [onViewDetails] - Ver detalles de fuente
 */

/**
 * Tabla especializada para fuentes de energía
 * Muestra información técnica y características
 *
 * @param {FuentesTableProps} props - Propiedades del componente
 * @example
 * <FuentesTable
 *   fuentes={fuentes}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
const FuentesTable = ({ fuentes = [], loading = false, onEdit, onDelete, onViewDetails }) => {
  /**
   * Configuración de iconos y colores por tipo de fuente
   */
  const fuenteConfig = {
    Solar: {
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    Eólica: {
      icon: Wind,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    Hidroeléctrica: {
      icon: Droplet,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    Térmica: {
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      badgeColor: 'bg-red-100 text-red-800',
    },
    Biomasa: {
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badgeColor: 'bg-green-100 text-green-800',
    },
  };

  /**
   * Definición de columnas
   */
  const columns = [
    {
      key: 'tipo',
      label: 'Tipo de Fuente',
      sortable: true,
      render: (value) => {
        const config = fuenteConfig[value] || fuenteConfig['Térmica'];
        const Icon = config.icon;

        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.bgColor} rounded-lg`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <span className="font-semibold text-gray-900">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'capacidad_instalada_mw',
      label: 'Capacidad (MW)',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-gray-900">
          {value ? formatNumber(value, 2) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'eficiencia_promedio',
      label: 'Eficiencia',
      sortable: true,
      align: 'center',
      render: (value) => {
        if (!value) return 'N/A';

        const color =
          value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';

        return <span className={`font-semibold ${color}`}>{value}%</span>;
      },
    },
    {
      key: 'es_renovable',
      label: 'Renovable',
      sortable: true,
      align: 'center',
      render: (value) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {value ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'factor_emision_co2',
      label: 'Emisión CO₂',
      sortable: true,
      align: 'right',
      render: (value) => {
        if (value === null || value === undefined) return 'N/A';

        const color =
          value === 0 ? 'text-green-600' : value < 0.5 ? 'text-yellow-600' : 'text-red-600';

        return <span className={`font-medium ${color}`}>{formatNumber(value, 2)} kg/kWh</span>;
      },
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (value) => (
        <span className="text-gray-600 text-sm line-clamp-2">{value || 'Sin descripción'}</span>
      ),
    },
  ];

  /**
   * Acciones disponibles
   */
  const actions = [
    ...(onViewDetails
      ? [
          {
            label: 'Ver Detalles',
            icon: TrendingUp,
            onClick: onViewDetails,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            label: 'Editar',
            icon: Edit,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Eliminar',
            icon: Trash2,
            onClick: onDelete,
            variant: 'danger',
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={fuentes}
      columns={columns}
      loading={loading}
      emptyMessage="No hay fuentes de energía registradas"
      showSearch={true}
      showPagination={true}
      pageSize={10}
      actions={actions}
    />
  );
};

export default FuentesTable;
