import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, usePredicciones, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  ArrowLeft,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3,
  Eye,
  Trash2,
  MapPin,
  Clock,
  Activity,
  Info,
  Download,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const HistorialPredicciones = () => {
  const { profile } = useAuth();
  const { predicciones, loading, deletePrediccion } = usePredicciones();
  const { municipios } = useMunicipios();

  const [filteredPredicciones, setFilteredPredicciones] = useState([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPrediccion, setSelectedPrediccion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [precisionStats, setPrecisionStats] = useState(null);

  useEffect(() => {
    filterAndSortPredicciones();
  }, [predicciones, selectedMunicipio, sortBy, sortOrder]);

  useEffect(() => {
    if (filteredPredicciones.length > 0) {
      calcularEstadisticasPrecision();
    }
  }, [filteredPredicciones]);

  const filterAndSortPredicciones = () => {
    let filtered = [...predicciones];

    if (selectedMunicipio) {
      filtered = filtered.filter((p) => p.municipio_id === parseInt(selectedMunicipio));
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'municipio') {
        aValue = a.municipios?.nombre || '';
        bValue = b.municipios?.nombre || '';
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
    });

    setFilteredPredicciones(filtered);
  };

  const calcularEstadisticasPrecision = () => {
    const precisions = filteredPredicciones
      .map((p) => p.precision)
      .filter((p) => p !== null && p !== undefined);

    if (precisions.length === 0) {
      setPrecisionStats(null);
      return;
    }

    const promedio = precisions.reduce((a, b) => a + b, 0) / precisions.length;
    const mejor = Math.min(...precisions);
    const peor = Math.max(...precisions);

    const excelentes = precisions.filter((p) => p < 500).length;
    const buenas = precisions.filter((p) => p >= 500 && p < 1000).length;
    const regulares = precisions.filter((p) => p >= 1000).length;

    setPrecisionStats({
      promedio,
      mejor,
      peor,
      total: precisions.length,
      excelentes,
      buenas,
      regulares,
    });
  };

  const handleDelete = async () => {
    if (!selectedPrediccion) return;

    try {
      await deletePrediccion(selectedPrediccion.id);
      setShowDeleteModal(false);
      setSelectedPrediccion(null);
      toast.success('Predicción eliminada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar');
    }
  };

  const getEstadoPrecision = (precision) => {
    if (!precision) return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (precision < 500) return { label: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (precision < 1000) return { label: 'Buena', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Regular', color: 'bg-red-100 text-red-800' };
  };

  const prepareChartData = () => {
    return filteredPredicciones.map((p) => ({
      fecha: formatDate(p.created_at, 'short'),
      precision: p.precision || 0,
      meses: p.meses_predichos,
      municipio: p.municipios?.nombre || 'N/A',
    }));
  };

  const chartData = prepareChartData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/predicciones">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Predicciones
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              Historial de Predicciones
            </h1>
            <p className="text-gray-600 mt-2">Revisa y analiza las predicciones anteriores</p>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      {precisionStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              {
                label: 'Total Predicciones',
                value: precisionStats.total,
                icon: Brain,
                color: 'purple',
              },
              {
                label: 'Precisión Promedio',
                value: formatNumber(precisionStats.promedio, 0),
                icon: Target,
                color: 'blue',
                suffix: 'MAE (kWh)',
              },
              {
                label: 'Mejor Precisión',
                value: formatNumber(precisionStats.mejor, 0),
                icon: CheckCircle2,
                color: 'green',
                suffix: 'MAE (kWh)',
              },
              { label: 'Distribución', icon: Activity, color: 'orange', custom: true },
            ].map((stat, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                {stat.custom ? (
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      {precisionStats.excelentes} ★
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">{precisionStats.buenas}</Badge>
                    <Badge className="bg-red-100 text-red-800">{precisionStats.regulares}</Badge>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.suffix && <p className="text-xs text-gray-500 mt-1">{stat.suffix}</p>}
                  </>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Select
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                  className="pl-10"
                >
                  <option value="">Todos los municipios</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="created_at">Fecha</option>
                <option value="precision">Precisión</option>
                <option value="meses_predichos">Meses predichos</option>
                <option value="municipio">Municipio</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
              <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Gráfico de evolución */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Evolución de la Precisión</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'MAE (kWh)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  name="Precisión (MAE)"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Valores más bajos indican mejor precisión. Un MAE bajo significa que las
                  predicciones están más cerca de los valores reales.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Lista de predicciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando historial...</p>
          </div>
        ) : filteredPredicciones.length === 0 ? (
          <Card className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay predicciones registradas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza generando predicciones para ver el historial aquí
            </p>
            <Link to="/predicciones">
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Generar Predicción
              </Button>
            </Link>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Fecha', 'Municipio', 'Meses', 'Precisión', 'Estado', 'Acciones'].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-${
                          h === 'Acciones' ? 'center' : 'left'
                        } text-xs font-medium text-gray-500 uppercase`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPredicciones.map((prediccion) => {
                    const estado = getEstadoPrecision(prediccion.precision);

                    return (
                      <tr key={prediccion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(prediccion.created_at)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(prediccion.created_at).toLocaleTimeString('es', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {prediccion.municipios?.nombre || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant="outline">{prediccion.meses_predichos} meses</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {prediccion.precision ? (
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatNumber(prediccion.precision, 0)}
                              </p>
                              <p className="text-xs text-gray-500">MAE (kWh)</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge className={estado.color}>{estado.label}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info('Funcionalidad en desarrollo')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPrediccion(prediccion);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Modal de confirmación */}
      {showDeleteModal && selectedPrediccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-600 mt-1">
                  ¿Estás seguro de eliminar esta predicción?
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Municipio:</strong> {selectedPrediccion.municipios?.nombre || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Fecha:</strong> {formatDate(selectedPrediccion.created_at)}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Meses predichos:</strong> {selectedPrediccion.meses_predichos}
              </p>
            </div>

            <p className="text-sm text-red-600 mb-6">⚠️ Esta acción no se puede deshacer.</p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrediccion(null);
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

export default HistorialPredicciones;
