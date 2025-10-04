import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { profileService } from '@/services/supabase/profile.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Table } from '@/components/ui/table';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

const Usuarios = () => {
  const { profile, isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      return;
    }
    fetchUsuarios();
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await profileService.getAllProfiles();

      if (error) throw error;

      setUsuarios(data || []);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const { error } = await profileService.changeRole(userId, newRole);

      if (error) throw error;

      setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success('Rol actualizado exitosamente');
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar rol');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Aquí implementarías la lógica de eliminación
      toast.success('Usuario eliminado exitosamente');
      setUsuarios((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
      gestor: { color: 'bg-blue-100 text-blue-800', label: 'Gestor' },
      viewer: { color: 'bg-gray-100 text-gray-800', label: 'Visualizador' },
    };
    return badges[role] || badges.viewer;
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2">Administra los usuarios de la plataforma</p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por rol */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="gestor">Gestores</option>
                <option value="viewer">Visualizadores</option>
              </Select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-end gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Filtrados</p>
                <p className="text-2xl font-bold">{filteredUsuarios.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabla de usuarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsuarios.map((user) => {
                    const roleBadge = getRoleBadge(user.role);

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">
                                  {user.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.departamentos?.nombre || 'No asignado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.created_at, 'short')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              className="text-sm"
                              disabled={user.id === profile.id}
                            >
                              <option value="admin">Admin</option>
                              <option value="gestor">Gestor</option>
                              <option value="viewer">Visualizador</option>
                            </Select>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {user.id !== profile.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{selectedUser?.full_name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Usuarios;
