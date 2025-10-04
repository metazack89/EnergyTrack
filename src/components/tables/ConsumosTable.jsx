import DataTable from './DataTable';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * @typedef {Object} ConsumosTableProps
 * @property {Array<Object>} consumos - Lista de consumos
 * @property {boolean} [loading] - Estado de carga
 * @property {Function} [onView] - Ver detalles del consumo
 * @property {Function} [onEdit] - Editar consumo
 * @property {Function} [onDelete] - Eliminar consumo
 */

/**
 * Tabla especializada para mostrar consumos energéticos
 * Incluye formateo de datos y acciones específicas
 *
 * @param {ConsumosTableProps} props - Propiedades del componente
 * @example
 * <ConsumosTable
 *   consumos={consumos}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
const ConsumosTable = ({ consumos = [], loading = false, onView, onEdit, onDelete }) => {
  /**
   * Definición de columnas de la tabla
   */
  const columns = [
    {
      key: 'anio',
      label: 'Año',
      sortable: true,
      align: 'center',
    },
    {
      key: 'mes',
      label: 'Mes',
      sortable: true,
      align: 'center',
      render: (value) => {
        const meses = [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];
        return meses[value - 1] || value;
      },
    },
    {
      key: 'municipios',
      label: 'Municipio',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{value?.nombre || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'fuentes_energia',
      label: 'Fuente',
      sortable: true,
      render: (value) => {
        const colors = {
          Solar: 'bg-yellow-100 text-yellow-800',
          Eólica: 'bg-blue-100 text-blue-800',
          Hidroeléctrica: 'bg-cyan-100 text-cyan-800',
          Térmica: 'bg-red-100 text-red-800',
        };
        const color = colors[value?.tipo] || 'bg-gray-100 text-gray-800';
        return <Badge className={color}>{value?.tipo || 'N/A'}</Badge>;
      },
    },
    {
      key: 'valor_kwh',
      label: 'Consumo (kWh)',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-gray-900">{formatNumber(value, 0)}</span>
      ),
    },
    {
      key: 'tendencia',
      label: 'Tendencia',
      align: 'center',
      render: (_, row) => {
        // Calcular tendencia comparando con mes anterior (placeholder)
        const tendencia = Math.random() > 0.5 ? 'up' : 'down';
        const cambio = (Math.random() * 10).toFixed(1);

        return tendencia === 'up' ? (
          <div className="flex items-center justify-center gap-1 text-red-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">+{cambio}%</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">-{cambio}%</span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      render: (value) => <span className="text-gray-600">{formatDate(value)}</span>,
    },
  ];

  /**
   * Acciones disponibles por fila
   */
  const actions = [
    ...(onView
      ? [
          {
            label: 'Ver Detalles',
            icon: Eye,
            onClick: onView,
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
      data={consumos}
      columns={columns}
      loading={loading}
      emptyMessage="No hay consumos registrados"
      showSearch={true}
      showPagination={true}
      pageSize={15}
      actions={actions}
    />
  );
};

export default ConsumosTable;
