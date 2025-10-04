import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useConsumos, useMunicipios, useFuentesEnergia } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  MapPin,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const ConsumosList = () => {
  const navigate = useNavigate();
  const { profile, isGestor } = useAuth();
  const { consumos, loading, deleteConsumo, filters, setFilters } = useConsumos();
  const { municipios } = useMunicipios();
  const { fuentes } = useFuentesEnergia();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedFuente, setSelectedFuente] = useState('');
  const [selectedAnio, setSelectedAnio] = useState('');
  const [selectedMes, setSelectedMes] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConsumo, setSelectedConsumo] = useState(null);

  // Obtener años únicos de los consumos
  const aniosUnicos = [...new Set(consumos.map((c) => c.anio))].sort((a, b) => b - a);

  // Filtrar consumos
  const filteredConsumos = consumos.filter((consumo) => {
    const matchesSearch =
      consumo.municipios?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumo.fuentes_energia?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMunicipio =
      !selectedMunicipio || consumo.municipio_id === parseInt(selectedMunicipio);
    const matchesFuente = !selectedFuente || consumo.fuente_id === parseInt(selectedFuente);
    const matchesAnio = !selectedAnio || consumo.anio === parseInt(selectedAnio);
    const matchesMes = !selectedMes || consumo.mes === parseInt(selectedMes);

    return matchesSearch && matchesMunicipio && matchesFuente && matchesAnio && matchesMes;
  });

  // Ordenar consumos
  const sortedConsumos = [...filteredConsumos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Para campos relacionados
    if (sortField === 'municipio') {
      aValue = a.municipios?.nombre || '';
      bValue = b.municipios?.nombre || '';
    }
    if (sortField === 'fuente') {
      aValue = a.fuentes_energia?.nombre || '';
      bValue = b.fuentes_energia?.nombre || '';
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginación
  const totalPages = Math.ceil(sortedConsumos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsumos = sortedConsumos.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async () => {
    if (!selectedConsumo) return;

    try {
      await deleteConsumo(selectedConsumo.id);
      setShowDeleteModal(false);
      setSelectedConsumo(null);
      toast.success('Consumo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting consumo:', error);
      toast.error('Error al eliminar el consumo');
    }
  };

  const handleExport = () => {
    const csvData = filteredConsumos.map((c) => ({
      Fecha: `${c.anio}-${String(c.mes).padStart(2, '0')}`,
      Municipio: c.municipios?.nombre || '',
      Fuente: c.fuentes_energia?.nombre || '',
      'Consumo (kWh)': c.valor_kwh,
      Registrado: formatDate(c.created_at),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consumos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMunicipio('');
    setSelectedFuente('');
    setSelectedAnio('');
    setSelectedMes('');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary-600" />
              Consumos de Energía
            </h1>
            <p className="text-gray-600 mt-2">Gestiona y visualiza los registros de consumo</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredConsumos.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {isGestor && (
              <Link to="/consumos/nuevo">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Registro
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
            {(searchTerm || selectedMunicipio || selectedFuente || selectedAnio || selectedMes) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por municipio o fuente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Municipio */}
            <Select
              value={selectedMunicipio}
              onChange={(e) => setSelectedMunicipio(e.target.value)}
            >
              <option value="">Todos los municipios</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Select>

            {/* Fuente */}
            <Select value={selectedFuente} onChange={(e) => setSelectedFuente(e.target.value)}>
              <option value="">Todas las fuentes</option>
              {fuentes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </Select>

            {/* Año */}
            <Select value={selectedAnio} onChange={(e) => setSelectedAnio(e.target.value)}>
              <option value="">Todos los años</option>
              {aniosUnicos.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </Select>

            {/* Mes */}
            <Select value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)}>
              <option value="">Todos los meses</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                <option key={mes} value={mes}>
                  {new Date(2000, mes - 1).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </Select>
          </div>

          {/* Estadísticas de filtrado */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Mostrando <strong>{filteredConsumos.length}</strong> de{' '}
              <strong>{consumos.length}</strong> registros
            </span>
            {filteredConsumos.length > 0 && (
              <span>
                Total:{' '}
                <strong>
                  {formatNumber(
                    filteredConsumos.reduce((sum, c) => sum + Number(c.valor_kwh), 0),
                    0
                  )}
                </strong>{' '}
                kWh
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Lista de consumos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando consumos...</p>
          </div>
        ) : currentConsumos.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron registros</p>
            <p className="text-sm text-gray-500 mt-2">
              {consumos.length === 0
                ? 'Comienza registrando tu primer consumo'
                : 'Prueba ajustando los filtros de búsqueda'}
            </p>
            {isGestor && consumos.length === 0 && (
              <Link to="/consumos/nuevo">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primer Consumo
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
            {/* Tabla */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('anio')}
                      >
                        <div className="flex items-center gap-2">
                          Período
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('municipio')}
                      >
                        <div className="flex items-center gap-2">
                          Municipio
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('fuente')}
                      >
                        <div className="flex items-center gap-2">
                          Fuente
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('valor_kwh')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Consumo (kWh)
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentConsumos.map((consumo) => (
                      <motion.tr
                        key={consumo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {new Date(consumo.anio, consumo.mes - 1).toLocaleString('es', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{consumo.municipios?.nombre || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="capitalize">
                            {consumo.fuentes_energia?.tipo || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatNumber(consumo.valor_kwh, 2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(consumo.created_at, 'short')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link to={`/consumos/${consumo.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {isGestor && (
                              <>
                                <Link to={`/consumos/${consumo.id}/editar`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedConsumo(consumo);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro de consumo? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedConsumo(null);
                }}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConsumosList;
