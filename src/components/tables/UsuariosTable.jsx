import DataTable from './DataTable';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { User, Shield, Edit, Trash2, Mail, Lock } from 'lucide-react';

/**
 * @typedef {Object} UsuariosTableProps
 * @property {Array<Object>} usuarios - Lista de usuarios
 * @property {boolean} [loading] - Estado de carga
 * @property {Function} [onEdit] - Editar usuario
 * @property {Function} [onDelete] - Eliminar usuario
 * @property {Function} [onChangeRole] - Cambiar rol de usuario
 * @property {Function} [onResetPassword] - Resetear contraseña
 */

/**
 * Tabla especializada para gestión de usuarios
 * Incluye información de roles y acciones administrativas
 *
 * @param {UsuariosTableProps} props - Propiedades del componente
 * @example
 * <UsuariosTable
 *   usuarios={usuarios}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onChangeRole={handleChangeRole}
 * />
 */
const UsuariosTable = ({
  usuarios = [],
  loading = false,
  onEdit,
  onDelete,
  onChangeRole,
  onResetPassword,
}) => {
  /**
   * Configuración de badges por rol
   */
  const roleConfig = {
    admin: {
      label: 'Administrador',
      className: 'bg-purple-100 text-purple-800',
      icon: Shield,
    },
    analista: {
      label: 'Analista',
      className: 'bg-blue-100 text-blue-800',
      icon: User,
    },
    visor: {
      label: 'Visor',
      className: 'bg-gray-100 text-gray-800',
      icon: User,
    },
  };

  /**
   * Definición de columnas
   */
  const columns = [
    {
      key: 'nombre',
      label: 'Usuario',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {value?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      align: 'center',
      render: (value) => {
        const config = roleConfig[value] || roleConfig.visor;
        const RoleIcon = config.icon;

        return (
          <Badge className={config.className}>
            <RoleIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'departamento',
      label: 'Departamento',
      sortable: true,
      render: (value) => <span className="text-gray-700">{value || 'Sin asignar'}</span>,
    },
    {
      key: 'ultimo_acceso',
      label: 'Último Acceso',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-gray-400">Nunca</span>;

        const date = new Date(value);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 24) {
          return <span className="text-green-600 font-medium">Hace {diffHours}h</span>;
        }

        return <span className="text-gray-600">{formatDate(value)}</span>;
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      align: 'center',
      render: (value, row) => {
        const isActive = row.email_verified_at !== null;

        return (
          <Badge
            className={isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
          >
            {isActive ? 'Activo' : 'Pendiente'}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      render: (value) => <span className="text-gray-600 text-sm">{formatDate(value)}</span>,
    },
  ];

  /**
   * Acciones disponibles
   */
  const actions = [
    ...(onEdit
      ? [
          {
            label: 'Editar Perfil',
            icon: Edit,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onChangeRole
      ? [
          {
            label: 'Cambiar Rol',
            icon: Shield,
            onClick: onChangeRole,
          },
        ]
      : []),
    ...(onResetPassword
      ? [
          {
            label: 'Resetear Contraseña',
            icon: Lock,
            onClick: onResetPassword,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Eliminar Usuario',
            icon: Trash2,
            onClick: onDelete,
            variant: 'danger',
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={usuarios}
      columns={columns}
      loading={loading}
      emptyMessage="No hay usuarios registrados"
      showSearch={true}
      showPagination={true}
      pageSize={15}
      actions={actions}
    />
  );
};

export default UsuariosTable;
