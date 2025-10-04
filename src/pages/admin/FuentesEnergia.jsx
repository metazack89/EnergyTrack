import { useState, useEffect } from 'react';
import { useAuth, useFuentesEnergia, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Search,
  Plus,
  Edit,
  Trash2,
  Sun,
  Wind,
  Droplets,
  Flame,
  Power,
  Activity,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { APP_CONFIG } from '@/config/app.config';

const FuentesEnergia = () => {
  const { isGestor } = useAuth();
  const {
    fuentes,
    loading,
    createFuente,
    updateFuente,
    deleteFuente,
    cambiarEstado,
    getCapacidadPorTipo,
  } = useFuentesEnergia();
  const { municipios } = useMunicipios();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFuente, setEditingFuente] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFuente, setSelectedFuente] = useState(null);
  const [capacidadPorTipo, setCapacidadPorTipo] = useState({});

  const [formData, setFormData] = useState({
    tipo: '',
    nombre: '',
    capacidad_mw: '',
    ubicacion: '',
    estado: 'activa',
    municipio_id: '',
  });

  useEffect(() => {
    loadCapacidadPorTipo();
  }, [fuentes]);

  const loadCapacidadPorTipo = async () => {
    const { data } = await getCapacidadPorTipo();
    if (data) {
      setCapacidadPorTipo(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFuente) {
        await updateFuente(editingFuente.id, formData);
      } else {
        await createFuente(formData);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving fuente:', error);
    }
  };

  const handleEdit = (fuente) => {
    setEditingFuente(fuente);
    setFormData({
      tipo: fuente.tipo,
      nombre: fuente.nombre,
      capacidad_mw: fuente.capacidad_mw || '',
      ubicacion: fuente.ubicacion || '',
      estado: fuente.estado,
      municipio_id: fuente.municipio_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedFuente) return;

    try {
      await deleteFuente(selectedFuente.id);
      setShowDeleteModal(false);
      setSelectedFuente(null);
    } catch (error) {
      console.error('Error deleting fuente:', error);
    }
  };

  const handleToggleEstado = async (fuente) => {
    const nuevoEstado = fuente.estado === 'activa' ? 'inactiva' : 'activa';
    await cambiarEstado(fuente.id, nuevoEstado);
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      nombre: '',
      capacidad_mw: '',
      ubicacion: '',
      estado: 'activa',
      municipio_id: '',
    });
    setEditingFuente(null);
  };

  // Filtrar fuentes
  const filteredFuentes = fuentes.filter((fuente) => {
    const matchesSearch =
      fuente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fuente.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === 'all' || fuente.tipo === tipoFilter;
    const matchesEstado = estadoFilter === 'all' || fuente.estado === estadoFilter;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Iconos por tipo de fuente
  const getTipoIcon = (tipo) => {
    const icons = {
      electrica: Power,
      solar: Sun,
      eolica: Wind,
      hidroelectrica: Droplets,
      biomasa: Flame,
    };
    return icons[tipo] || Zap;
  };

  // Colores por tipo
  const getTipoColor = (tipo) => {
    const colors = {
      electrica: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      solar: 'bg-orange-100 text-orange-800 border-orange-200',
      eolica: 'bg-blue-100 text-blue-800 border-blue-200',
      hidroelectrica: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      biomasa: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Calcular estadísticas
  const totalCapacidad = fuentes.reduce((sum, f) => sum + (Number(f.capacidad_mw) || 0), 0);
  const fuentesActivas = fuentes.filter((f) => f.estado === 'activa').length;

  if (!isGestor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para gestionar fuentes de energía</p>
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
              <Zap className="w-8 h-8 text-primary-600" />
              Gestión de Fuentes de Energía
            </h1>
            <p className="text-gray-600 mt-2">Administra las fuentes de energía disponibles</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Fuente
          </Button>
        </div>
      </motion.div>

      {/* Estadísticas generales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fuentes</p>
              <p className="text-3xl font-bold">{fuentes.length}</p>
            </div>
            <Zap className="w-12 h-12 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fuentes Activas</p>
              <p className="text-3xl font-bold text-green-600">{fuentesActivas}</p>
            </div>
            <Activity className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Capacidad Total</p>
              <p className="text-3xl font-bold">{formatNumber(totalCapacidad, 1)}</p>
              <p className="text-xs text-gray-500">MW</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tipos Diferentes</p>
              <p className="text-3xl font-bold">{Object.keys(capacidadPorTipo).length}</p>
            </div>
            <Power className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>
      </motion.div>

      {/* Capacidad por tipo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Capacidad por Tipo de Energía</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(capacidadPorTipo).map(([tipo, capacidad]) => {
              const Icon = getTipoIcon(tipo);
              const colorClass = getTipoColor(tipo);

              return (
                <div key={tipo} className={`p-4 rounded-lg border ${colorClass}`}>
                  <Icon className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium capitalize">{tipo}</p>
                  <p className="text-2xl font-bold">{formatNumber(capacidad, 1)}</p>
                  <p className="text-xs opacity-75">MW</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar fuente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
              <option value="all">Todos los tipos</option>
              {Object.keys(APP_CONFIG.tiposFuente).map((tipo) => (
                <option key={tipo} value={tipo} className="capitalize">
                  {tipo}
                </option>
              ))}
            </Select>

            <Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="mantenimiento">Mantenimiento</option>
            </Select>
          </div>
        </Card>
      </motion.div>

      {/* Grid de fuentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando fuentes...</p>
          </div>
        ) : filteredFuentes.length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron fuentes de energía</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFuentes.map((fuente) => {
              const Icon = getTipoIcon(fuente.tipo);
              const colorClass = getTipoColor(fuente.tipo);

              return (
                <motion.div
                  key={fuente.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{fuente.nombre}</h3>
                          <Badge variant="outline" className={`mt-1 capitalize ${colorClass}`}>
                            {fuente.tipo}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-3 mb-4">
                      {/* Capacidad */}
                      {fuente.capacidad_mw && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Capacidad</span>
                          <span className="font-semibold">
                            {formatNumber(fuente.capacidad_mw, 2)} MW
                          </span>
                        </div>
                      )}

                      {/* Municipio */}
                      {fuente.municipios && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {fuente.municipios.nombre}
                        </div>
                      )}

                      {/* Ubicación */}
                      {fuente.ubicacion && (
                        <div className="text-sm text-gray-600">📍 {fuente.ubicacion}</div>
                      )}

                      {/* Estado */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado</span>
                        <Badge
                          className={
                            fuente.estado === 'activa'
                              ? 'bg-green-100 text-green-800'
                              : fuente.estado === 'mantenimiento'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {fuente.estado}
                        </Badge>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(fuente)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>

                      <Button
                        variant={fuente.estado === 'activa' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleEstado(fuente)}
                      >
                        <Activity className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedFuente(fuente);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal de crear/editar */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingFuente ? 'Editar Fuente' : 'Nueva Fuente de Energía'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <Select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {Object.keys(APP_CONFIG.tiposFuente).map((tipo) => (
                    <option key={tipo} value={tipo} className="capitalize">
                      {tipo}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Planta Solar Norte"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Municipio *</label>
                <Select
                  value={formData.municipio_id}
                  onChange={(e) => setFormData({ ...formData, municipio_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id} value={municipio.id}>
                      {municipio.nombre} - {municipio.departamentos?.nombre}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacidad (MW)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.capacidad_mw}
                  onChange={(e) => setFormData({ ...formData, capacidad_mw: e.target.value })}
                  placeholder="Ej: 50.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <Input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="Ej: Vereda El Carmen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado *</label>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                >
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingFuente ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar la fuente <strong>{selectedFuente?.nombre}</strong>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedFuente(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FuentesEnergia;
