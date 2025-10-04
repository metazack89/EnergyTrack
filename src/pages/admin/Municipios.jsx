import { useState, useEffect } from 'react';
import { useAuth, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Plus, Edit, Trash2, Users, Zap, TrendingUp, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

const Municipios = () => {
  const { isAdmin, isGestor } = useAuth();
  const {
    municipios,
    loading,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio,
    getEstadisticas,
  } = useMunicipios();

  const [searchTerm, setSearchTerm] = useState('');
  const [departamentoFilter, setDepartamentoFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMunicipio, setSelectedMunicipio] = useState(null);
  const [municipioStats, setMunicipioStats] = useState({});

  const [formData, setFormData] = useState({
    nombre: '',
    departamento_id: '',
    poblacion: '',
    latitud: '',
    longitud: '',
  });

  useEffect(() => {
    // Cargar estadísticas para cada municipio
    municipios.forEach(async (municipio) => {
      const { data } = await getEstadisticas(municipio.id);
      if (data) {
        setMunicipioStats((prev) => ({
          ...prev,
          [municipio.id]: data,
        }));
      }
    });
  }, [municipios]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMunicipio) {
        await updateMunicipio(editingMunicipio.id, formData);
      } else {
        await createMunicipio(formData);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving municipio:', error);
    }
  };

  const handleEdit = (municipio) => {
    setEditingMunicipio(municipio);
    setFormData({
      nombre: municipio.nombre,
      departamento_id: municipio.departamento_id,
      poblacion: municipio.poblacion || '',
      latitud: municipio.latitud || '',
      longitud: municipio.longitud || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedMunicipio) return;

    try {
      await deleteMunicipio(selectedMunicipio.id);
      setShowDeleteModal(false);
      setSelectedMunicipio(null);
    } catch (error) {
      console.error('Error deleting municipio:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      departamento_id: '',
      poblacion: '',
      latitud: '',
      longitud: '',
    });
    setEditingMunicipio(null);
  };

  // Filtrar municipios
  const filteredMunicipios = municipios.filter((municipio) => {
    const matchesSearch = municipio.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartamento =
      departamentoFilter === 'all' || municipio.departamento_id === parseInt(departamentoFilter);

    return matchesSearch && matchesDepartamento;
  });

  if (!isGestor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para gestionar municipios</p>
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
              <Map className="w-8 h-8 text-primary-600" />
              Gestión de Municipios
            </h1>
            <p className="text-gray-600 mt-2">
              Administra los municipios de Santander y Norte de Santander
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Municipio
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={departamentoFilter}
              onChange={(e) => setDepartamentoFilter(e.target.value)}
            >
              <option value="all">Todos los departamentos</option>
              <option value="1">Santander</option>
              <option value="2">Norte de Santander</option>
            </Select>

            <div className="flex items-center justify-end text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total Municipios</p>
                <p className="text-2xl font-bold">{filteredMunicipios.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grid de municipios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando municipios...</p>
          </div>
        ) : filteredMunicipios.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron municipios</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMunicipios.map((municipio) => {
              const stats = municipioStats[municipio.id];

              return (
                <motion.div
                  key={municipio.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{municipio.nombre}</h3>
                          <Badge variant="outline" className="mt-1">
                            {municipio.departamentos?.nombre}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    {stats && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                          <p className="text-xs text-gray-600">Población</p>
                          <p className="font-semibold text-sm">
                            {formatNumber(municipio.poblacion || 0, 0)}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <Zap className="w-4 h-4 mx-auto mb-1 text-green-600" />
                          <p className="text-xs text-gray-600">Consumos</p>
                          <p className="font-semibold text-sm">{stats.numeroConsumos || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                          <p className="text-xs text-gray-600">Fuentes</p>
                          <p className="font-semibold text-sm">{stats.fuentesActivas || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Coordenadas */}
                    {municipio.latitud && municipio.longitud && (
                      <div className="text-xs text-gray-500 mb-4">
                        📍 {municipio.latitud}, {municipio.longitud}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(municipio)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedMunicipio(municipio);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
            {editingMunicipio ? 'Editar Municipio' : 'Nuevo Municipio'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Departamento *</label>
                <Select
                  value={formData.departamento_id}
                  onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">Santander</option>
                  <option value="2">Norte de Santander</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Población</label>
                <Input
                  type="number"
                  value={formData.poblacion}
                  onChange={(e) => setFormData({ ...formData, poblacion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitud</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.latitud}
                    onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitud</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.longitud}
                    onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                  />
                </div>
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
              <Button type="submit">{editingMunicipio ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar el municipio{' '}
            <strong>{selectedMunicipio?.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedMunicipio(null);
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

export default Municipios;
