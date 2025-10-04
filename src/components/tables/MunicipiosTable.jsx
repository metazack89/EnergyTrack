import DataTable from './DataTable';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { MapPin, Edit, Trash2, BarChart3 } from 'lucide-react';

/**
 * @typedef {Object} MunicipiosTableProps
 * @property {Array<Object>} municipios - Lista de municipios
 * @property {boolean} [loading] - Estado de carga
 * @property {Function} [onEdit] - Editar municipio
 * @property {Function} [onDelete] - Eliminar municipio
 * @property {Function} [onViewStats] - Ver estadísticas
 */

/**
 * Tabla especializada para gestión de municipios
 *
 * @param {MunicipiosTableProps} props - Propiedades del componente
 */
const MunicipiosTable = ({ municipios = [], loading = false, onEdit, onDelete, onViewStats }) => {
  const columns = [
    {
      key: 'nombre',
      label: 'Municipio',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">Código: {row.codigo_dane}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'departamentos',
      label: 'Departamento',
      sortable: true,
      render: (value) => value?.nombre || 'N/A',
    },
    {
      key: 'poblacion',
      label: 'Población',
      sortable: true,
      align: 'right',
      render: (value) => (value ? formatNumber(value, 0) : 'N/A'),
    },
    {
      key: 'area_km2',
      label: 'Área (km²)',
      sortable: true,
      align: 'right',
      render: (value) => (value ? formatNumber(value, 2) : 'N/A'),
    },
    {
      key: 'densidad',
      label: 'Densidad',
      align: 'right',
      render: (_, row) => {
        if (!row.poblacion || !row.area_km2) return 'N/A';
        const densidad = row.poblacion / row.area_km2;
        return `${formatNumber(densidad, 0)} hab/km²`;
      },
    },
  ];

  const actions = [
    ...(onViewStats
      ? [
          {
            label: 'Ver Estadísticas',
            icon: BarChart3,
            onClick: onViewStats,
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
      data={municipios}
      columns={columns}
      loading={loading}
      emptyMessage="No hay municipios registrados"
      actions={actions}
      pageSize={20}
    />
  );
};

export default MunicipiosTable;
