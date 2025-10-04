import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useConsumos, useMunicipios, usePredicciones } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Brain,
  Calendar,
  MapPin,
  Zap,
  AlertCircle,
  Info,
  ArrowRight,
  RefreshCw,
  Download,
  Target,
  Activity,
  BarChart3,
  CheckCircle2,
  TrendingDown,
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
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import { predictorService } from '@/services/ml/predictor';
import toast from 'react-hot-toast';

const Predicciones = () => {
  const { profile } = useAuth();
  const { consumos } = useConsumos();
  const { municipios } = useMunicipios();
  const { guardarPrediccion } = usePredicciones();

  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [mesesPrediccion, setMesesPrediccion] = useState(6);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [precision, setPrecision] = useState(null);

  useEffect(() => {
    if (selectedMunicipio && consumos.length > 0) {
      generarPredicciones();
    }
  }, [selectedMunicipio, mesesPrediccion]);

  const generarPredicciones = async () => {
    try {
      setLoading(true);

      const consumosMunicipio = consumos
        .filter((c) => c.municipio_id === parseInt(selectedMunicipio))
        .sort((a, b) => new Date(a.anio, a.mes - 1) - new Date(b.anio, b.mes - 1));

      if (consumosMunicipio.length < 6) {
        toast.error('Se necesitan al menos 6 meses de datos');
        setResultados(null);
        setChartData([]);
        return;
      }

      // Agrupar por mes
      const consumosPorMes = {};
      consumosMunicipio.forEach((c) => {
        const key = `${c.anio}-${String(c.mes).padStart(2, '0')}`;
        consumosPorMes[key] = (consumosPorMes[key] || 0) + Number(c.valor_kwh);
      });

      const valores = Object.values(consumosPorMes);
      const fechas = Object.keys(consumosPorMes);
      const predicciones = predictorService.predecirConsumo(valores, parseInt(mesesPrediccion));
      const precisionCalc = calcularPrecision(valores);

      // Datos históricos
      const historico = fechas.map((fecha, i) => {
        const [anio, mes] = fecha.split('-');
        return {
          fecha,
          mes: new Date(parseInt(anio), parseInt(mes) - 1).toLocaleString('es', { month: 'short' }),
          valor: valores[i],
          tipo: 'histórico',
        };
      });

      // Datos predicción
      const ultimaFecha = new Date(fechas[fechas.length - 1] + '-01');
      const prediccionChart = predicciones.map((pred, i) => {
        const fecha = new Date(ultimaFecha);
        fecha.setMonth(fecha.getMonth() + i + 1);
        return {
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
          mes: fecha.toLocaleString('es', { month: 'short' }),
          prediccion: pred.valor,
          min: pred.min,
          max: pred.max,
          tipo: 'predicción',
        };
      });

      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      const promedioPredicciones =
        predicciones.reduce((a, b) => a + b.valor, 0) / predicciones.length;
      const variacionEsperada = ((promedioPredicciones - promedio) / promedio) * 100;

      setChartData([...historico, ...prediccionChart]);
      setResultados({
        predicciones,
        promedio,
        promedioPredicciones,
        variacionEsperada,
        totalHistorico: valores.reduce((a, b) => a + b, 0),
        totalPredicho: predicciones.reduce((a, b) => a + b.valor, 0),
      });
      setPrecision(precisionCalc);

      await guardarPrediccion({
        municipio_id: parseInt(selectedMunicipio),
        meses_predichos: parseInt(mesesPrediccion),
        valores_predichos: predicciones.map((p) => p.valor),
        precision: precisionCalc.mae,
        metadata: {
          promedio,
          variacionEsperada,
          metodo: 'Regresión Lineal + Suavizado Exponencial',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar predicciones');
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecision = (valores) => {
    if (valores.length < 12) return { mae: 0, mape: 0, rmse: 0 };

    const trainSize = valores.length - 6;
    const trainData = valores.slice(0, trainSize);
    const testData = valores.slice(trainSize);
    const predicciones = predictorService.predecirConsumo(trainData, 6);

    const errores = testData.map((real, i) => Math.abs(real - predicciones[i].valor));
    const mae = errores.reduce((a, b) => a + b, 0) / errores.length;
    const mape =
      (errores.reduce((sum, error, i) => sum + Math.abs(error / testData[i]), 0) /
        testData.length) *
      100;
    const rmse = Math.sqrt(errores.reduce((sum, error) => sum + error * error, 0) / errores.length);

    return { mae, mape, rmse };
  };

  const handleExport = () => {
    if (!resultados) return;

    const csvData = [
      ['Mes', 'Predicción (kWh)', 'Mínimo (kWh)', 'Máximo (kWh)'],
      ...chartData
        .filter((d) => d.tipo === 'predicción')
        .map((d) => [
          d.mes,
          d.prediccion?.toFixed(2) || '',
          d.min?.toFixed(2) || '',
          d.max?.toFixed(2) || '',
        ]),
    ];

    const csv = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `predicciones-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Predicciones exportadas');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary-600" />
              Predicciones de Consumo
            </h1>
            <p className="text-gray-600 mt-2">
              Proyecciones basadas en Machine Learning para planificación energética
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/predicciones/simulador">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Simulador
              </Button>
            </Link>
            <Link to="/predicciones/historial">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Historial
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Configuración */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            Configuración de Predicción
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Municipio *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Select
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                  className="pl-10"
                >
                  <option value="">Seleccionar municipio...</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses a Predecir
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Select
                  value={mesesPrediccion}
                  onChange={(e) => setMesesPrediccion(e.target.value)}
                  className="pl-10"
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                </Select>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={generarPredicciones}
                disabled={!selectedMunicipio || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generar Predicción
                  </>
                )}
              </Button>
            </div>
          </div>

          {!selectedMunicipio && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Selecciona un municipio para generar predicciones. Se requieren al menos 6 meses de
                datos históricos.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Resultados */}
      {resultados && (
        <>
          {/* Métricas de precisión */}
          {precision && precision.mae > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Precisión del Modelo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Error Medio Absoluto (MAE)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(precision.mae, 0)} kWh
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Desviación promedio</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Error Porcentual (MAPE)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(precision.mape, 1)}%
                    </p>
                    <Badge
                      className={`mt-1 ${
                        precision.mape < 10
                          ? 'bg-green-100 text-green-800'
                          : precision.mape < 20
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {precision.mape < 10
                        ? 'Excelente'
                        : precision.mape < 20
                        ? 'Buena'
                        : 'Regular'}
                    </Badge>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">RMSE</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(precision.rmse, 0)} kWh
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Error cuadrático medio</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[
                {
                  label: 'Promedio Histórico',
                  value: resultados.promedio,
                  icon: Activity,
                  color: 'blue',
                  suffix: 'kWh/mes',
                },
                {
                  label: 'Promedio Predicho',
                  value: resultados.promedioPredicciones,
                  icon: Brain,
                  color: 'purple',
                  suffix: 'kWh/mes',
                },
                {
                  label: 'Variación Esperada',
                  value: resultados.variacionEsperada,
                  icon: resultados.variacionEsperada > 0 ? TrendingUp : TrendingDown,
                  color: resultados.variacionEsperada > 0 ? 'red' : 'green',
                  suffix: '%',
                  prefix: resultados.variacionEsperada > 0 ? '+' : '',
                },
                {
                  label: 'Total Predicho',
                  value: resultados.totalPredicho,
                  icon: Zap,
                  color: 'yellow',
                  suffix: 'kWh totales',
                },
              ].map((stat, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      stat.color !== 'yellow' && stat.color !== 'blue' && stat.color !== 'purple'
                        ? `text-${stat.color}-600`
                        : 'text-gray-900'
                    }`}
                  >
                    {stat.prefix || ''}
                    {formatNumber(stat.value, stat.suffix.includes('%') ? 1 : 0)}
                    {stat.suffix.includes('%') ? '%' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.suffix}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Gráfico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proyección de Consumo</h3>
                  <p className="text-sm text-gray-600">
                    Histórico y predicciones para los próximos {mesesPrediccion} meses
                  </p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(v) => formatNumber(v, 0)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value, name) => [
                      formatNumber(value, 0) + ' kWh',
                      name === 'prediccion' ? 'Predicción' : 'Histórico',
                    ]}
                  />
                  <Legend />
                  <ReferenceLine
                    y={resultados.promedio}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label={{
                      value: 'Prom. histórico',
                      position: 'insideTopRight',
                      fill: '#6b7280',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    fill="#a855f7"
                    fillOpacity={0.1}
                    stroke="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    fill="#ffffff"
                    fillOpacity={1}
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Histórico"
                  />
                  <Line
                    type="monotone"
                    dataKey="prediccion"
                    stroke="#a855f7"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ fill: '#a855f7', r: 5 }}
                    name="Predicción"
                  />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Datos históricos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-0.5 bg-purple-500"
                    style={{ borderTop: '3px dashed' }}
                  ></div>
                  <span className="text-gray-600">Predicción</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-3 bg-purple-500 opacity-20 rounded"></div>
                  <span className="text-gray-600">Intervalo confianza (95%)</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Interpretación y Recomendaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Interpretación</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        {resultados.variacionEsperada > 10
                          ? `⚠️ Aumento significativo del ${formatNumber(
                              resultados.variacionEsperada,
                              1
                            )}%. Considera medidas de eficiencia.`
                          : resultados.variacionEsperada < -10
                          ? `✅ Reducción del ${formatNumber(
                              Math.abs(resultados.variacionEsperada),
                              1
                            )}%. Excelente optimización.`
                          : '✓ El consumo se mantendrá estable en el rango histórico.'}
                      </p>
                      {precision && precision.mape > 0 && (
                        <p>
                          📊 Precisión del {formatNumber(100 - precision.mape, 1)}% (error{' '}
                          {formatNumber(precision.mape, 1)}%).
                        </p>
                      )}
                      <p>
                        💡 Basado en {chartData.filter((d) => d.tipo === 'histórico').length} meses
                        de datos.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Recomendaciones</h3>
                    <ul className="text-sm text-green-800 space-y-2">
                      <li>• Usa estas proyecciones para planificar presupuestos energéticos</li>
                      <li>• Monitorea mensualmente el ajuste con valores reales</li>
                      {resultados.variacionEsperada > 5 && (
                        <li>• Implementa medidas de ahorro preventivas</li>
                      )}
                      <li>• Explora el simulador para analizar escenarios</li>
                      <li>• Actualiza predicciones trimestralmente</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Tabla */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Valores Predichos Detallados</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {[
                        'Período',
                        'Predicción (kWh)',
                        'Rango Mínimo',
                        'Rango Máximo',
                        'vs Promedio',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-${
                            h === 'Período' ? 'left' : h === 'vs Promedio' ? 'center' : 'right'
                          } text-xs font-medium text-gray-500 uppercase`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chartData
                      .filter((d) => d.tipo === 'predicción')
                      .map((item, i) => {
                        const variacion =
                          ((item.prediccion - resultados.promedio) / resultados.promedio) * 100;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium capitalize">
                                  {item.mes} {item.fecha.split('-')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-lg font-semibold text-gray-900">
                                {formatNumber(item.prediccion, 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                              {formatNumber(item.min, 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                              {formatNumber(item.max, 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Badge
                                className={`${
                                  variacion > 10
                                    ? 'bg-red-100 text-red-800'
                                    : variacion < -10
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {variacion > 0 ? '+' : ''}
                                {formatNumber(variacion, 1)}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Explorar diferentes escenarios?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Usa el simulador para analizar el impacto de cambios en el consumo
                  </p>
                </div>
                <Link to="/predicciones/simulador">
                  <Button>
                    Ir al Simulador
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Predicciones;
