import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useConsumos } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const ConsumoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isGestor } = useAuth();
  const { consumos, getConsumoById, deleteConsumo } = useConsumos();

  const [consumo, setConsumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadConsumo();
  }, [id]);

  const loadConsumo = async () => {
    try {
      setLoading(true);
      const data = await getConsumoById(id);

      if (!data) {
        toast.error('Consumo no encontrado');
        navigate('/consumos');
        return;
      }

      setConsumo(data);

      // Cargar historial del mismo municipio y fuente
      if (data.municipio_id && data.fuente_id) {
        const historico = consumos
          .filter(
            (c) =>
              c.municipio_id === data.municipio_id &&
              c.fuente_id === data.fuente_id &&
              c.id !== data.id
          )
          .sort((a, b) => {
            const dateA = new Date(a.anio, a.mes - 1);
            const dateB = new Date(b.anio, b.mes - 1);
            return dateA - dateB;
          })
          .slice(-12); // Últimos 12 meses

        setHistorial(historico);

        // Calcular estadísticas
        calcularEstadisticas(data, historico);
      }
    } catch (error) {
      console.error('Error loading consumo:', error);
      toast.error('Error al cargar el consumo');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (consumoActual, historico) => {
    if (historico.length === 0) {
      setEstadisticas(null);
      return;
    }

    const valores = historico.map((c) => Number(c.valor_kwh));
    const valorActual = Number(consumoActual.valor_kwh);

    // Promedio
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    // Máximo y mínimo
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);

    // Consumo anterior (mes anterior)
    const mesAnterior = consumoActual.mes === 1 ? 12 : consumoActual.mes - 1;
    const anioAnterior = consumoActual.mes === 1 ? consumoActual.anio - 1 : consumoActual.anio;
    const anterior = historico.find((c) => c.mes === mesAnterior && c.anio === anioAnterior);

    // Variación vs mes anterior
    let variacionAnterior = null;
    if (anterior) {
      variacionAnterior =
        ((valorActual - Number(anterior.valor_kwh)) / Number(anterior.valor_kwh)) * 100;
    }

    // Variación vs promedio
    const variacionPromedio = ((valorActual - promedio) / promedio) * 100;

    // Tendencia (últimos 6 meses si hay suficientes datos)
    let tendencia = 'estable';
    if (valores.length >= 6) {
      const ultimosSeis = valores.slice(-6);
      const primerosTres = ultimosSeis.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const ultimosTres = ultimosSeis.slice(-3).reduce((a, b) => a + b, 0) / 3;

      if (ultimosTres > primerosTres * 1.1) tendencia = 'creciente';
      else if (ultimosTres < primerosTres * 0.9) tendencia = 'decreciente';
    }

    setEstadisticas({
      promedio,
      maximo,
      minimo,
      anterior,
      variacionAnterior,
      variacionPromedio,
      tendencia,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteConsumo(id);
      toast.success('Consumo eliminado exitosamente');
      navigate('/consumos');
    } catch (error) {
      console.error('Error deleting consumo:', error);
      toast.error('Error al eliminar el consumo');
    }
  };

  const prepareChartData = () => {
    if (!consumo || historial.length === 0) return [];

    // Combinar historial + consumo actual
    const todosLosConsumos = [...historial, consumo].sort((a, b) => {
      const dateA = new Date(a.anio, a.mes - 1);
      const dateB = new Date(b.anio, b.mes - 1);
      return dateA - dateB;
    });

    return todosLosConsumos.map((c) => ({
      fecha: `${c.anio}-${String(c.mes).padStart(2, '0')}`,
      mes: new Date(c.anio, c.mes - 1).toLocaleString('es', { month: 'short' }),
      valor: Number(c.valor_kwh),
      actual: c.id === consumo.id,
      promedio: estadisticas?.promedio || 0,
    }));
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!consumo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Consumo no encontrado</h2>
          <p className="text-gray-600 mb-4">El consumo que buscas no existe</p>
          <Button onClick={() => navigate('/consumos')}>Volver a la lista</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/consumos')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la lista
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary-600" />
              Detalle del Consumo
            </h1>
            <p className="text-gray-600 mt-2">Información completa del registro de consumo</p>
          </div>

          {isGestor && (
            <div className="flex gap-3">
              <Link to={`/consumos/${id}/editar`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Información General</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Período */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(consumo.anio, consumo.mes - 1).toLocaleString('es', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Consumo */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consumo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(consumo.valor_kwh, 2)} kWh
                    </p>
                  </div>
                </div>

                {/* Municipio */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Municipio</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {consumo.municipios?.nombre || 'N/A'}
                    </p>
                    {consumo.municipios?.departamentos && (
                      <p className="text-sm text-gray-500">
                        {consumo.municipios.departamentos.nombre}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fuente */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuente de Energía</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {consumo.fuentes_energia?.nombre || 'N/A'}
                    </p>
                    {consumo.fuentes_energia?.tipo && (
                      <Badge className="mt-1 capitalize">{consumo.fuentes_energia.tipo}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Notas */}
              {consumo.notas && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Notas</p>
                      <p className="text-gray-900">{consumo.notas}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Registrado: {formatDate(consumo.created_at)}</span>
                </div>
                {consumo.updated_at && consumo.updated_at !== consumo.created_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Actualizado: {formatDate(consumo.updated_at)}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Gráfico de historial */}
          {chartData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Historial de Consumo</h2>
                    <p className="text-sm text-gray-600">Últimos {chartData.length} registros</p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => formatNumber(value, 0)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                      formatter={(value, name) => {
                        if (name === 'promedio')
                          return [formatNumber(value, 0) + ' kWh', 'Promedio'];
                        return [formatNumber(value, 0) + ' kWh', 'Consumo'];
                      }}
                    />

                    {estadisticas && (
                      <ReferenceLine
                        y={estadisticas.promedio}
                        stroke="#9ca3af"
                        strokeDasharray="5 5"
                        label={{
                          value: 'Promedio',
                          position: 'insideTopRight',
                          fill: '#6b7280',
                        }}
                      />
                    )}

                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={payload.actual ? 8 : 4}
                            fill={payload.actual ? '#10b981' : '#3b82f6'}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        );
                      }}
                      name="Consumo"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Historial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Consumo actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0.5 bg-gray-400"
                      style={{ borderTop: '2px dashed' }}
                    ></div>
                    <span className="text-gray-600">Promedio</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Columna lateral - Estadísticas */}
        <div className="space-y-6">
          {/* Variaciones */}
          {estadisticas && (
            <>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Variaciones</h3>

                  <div className="space-y-4">
                    {/* Vs mes anterior */}
                    {estadisticas.variacionAnterior !== null && (
                      <div
                        className={`p-4 rounded-lg ${
                          estadisticas.variacionAnterior > 0
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-green-50 border border-green-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Vs mes anterior</span>
                          {estadisticas.variacionAnterior > 0 ? (
                            <TrendingUp className="w-5 h-5 text-red-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <p
                          className={`text-2xl font-bold ${
                            estadisticas.variacionAnterior > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {estadisticas.variacionAnterior > 0 ? '+' : ''}
                          {formatNumber(estadisticas.variacionAnterior, 1)}%
                        </p>
                        {estadisticas.anterior && (
                          <p className="text-xs text-gray-500 mt-1">
                            Anterior: {formatNumber(estadisticas.anterior.valor_kwh, 0)} kWh
                          </p>
                        )}
                      </div>
                    )}

                    {/* Vs promedio */}
                    <div
                      className={`p-4 rounded-lg ${
                        estadisticas.variacionPromedio > 0
                          ? 'bg-orange-50 border border-orange-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vs promedio</span>
                        <Activity
                          className={`w-5 h-5 ${
                            estadisticas.variacionPromedio > 0 ? 'text-orange-600' : 'text-blue-600'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          estadisticas.variacionPromedio > 0 ? 'text-orange-600' : 'text-blue-600'
                        }`}
                      >
                        {estadisticas.variacionPromedio > 0 ? '+' : ''}
                        {formatNumber(estadisticas.variacionPromedio, 1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Promedio: {formatNumber(estadisticas.promedio, 0)} kWh
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Estadísticas históricas */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Estadísticas Históricas</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Máximo</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(estadisticas.maximo, 0)} kWh
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Promedio</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(estadisticas.promedio, 0)} kWh
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Mínimo</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(estadisticas.minimo, 0)} kWh
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tendencia</span>
                      <Badge
                        className={`
                        ${estadisticas.tendencia === 'creciente' ? 'bg-red-100 text-red-800' : ''}
                        ${
                          estadisticas.tendencia === 'decreciente'
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                        ${estadisticas.tendencia === 'estable' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                      >
                        {estadisticas.tendencia}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}

          {/* Interpretación */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Interpretación</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    {estadisticas?.variacionAnterior !== null && (
                      <p>
                        {estadisticas.variacionAnterior > 10 ? (
                          <>
                            ⚠️ El consumo aumentó significativamente respecto al mes anterior.
                            Considera revisar las causas.
                          </>
                        ) : estadisticas.variacionAnterior < -10 ? (
                          <>✅ Excelente reducción del consumo respecto al mes anterior.</>
                        ) : (
                          <>✓ El consumo se mantiene estable respecto al mes anterior.</>
                        )}
                      </p>
                    )}

                    {estadisticas?.variacionPromedio !== null && (
                      <p>
                        {Math.abs(estadisticas.variacionPromedio) > 20 ? (
                          <>
                            ⚠️ El consumo está{' '}
                            {estadisticas.variacionPromedio > 0
                              ? 'muy por encima'
                              : 'muy por debajo'}{' '}
                            del promedio histórico.
                          </>
                        ) : (
                          <>✓ El consumo está dentro del rango normal histórico.</>
                        )}
                      </p>
                    )}

                    {estadisticas?.tendencia === 'creciente' && (
                      <p>
                        📈 La tendencia general es creciente. Considera implementar medidas de
                        eficiencia energética.
                      </p>
                    )}

                    {estadisticas?.tendencia === 'decreciente' && (
                      <p>
                        📉 La tendencia general es decreciente. ¡Buen trabajo optimizando el
                        consumo!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Acciones rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>

              <div className="space-y-2">
                <Link to="/dashboard/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Análisis Completo
                  </Button>
                </Link>

                <Link to="/predicciones" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Predicciones
                  </Button>
                </Link>

                <Link to={`/consumos?municipio=${consumo.municipio_id}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver del Municipio
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
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
                  ¿Estás seguro de que deseas eliminar este registro de consumo?
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Período:</strong>{' '}
                {new Date(consumo.anio, consumo.mes - 1).toLocaleString('es', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Consumo:</strong> {formatNumber(consumo.valor_kwh, 2)} kWh
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Municipio:</strong> {consumo.municipios?.nombre}
              </p>
            </div>

            <p className="text-sm text-red-600 mb-6">⚠️ Esta acción no se puede deshacer.</p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
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

export default ConsumoDetail;
