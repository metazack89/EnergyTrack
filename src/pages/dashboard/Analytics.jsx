import { useState, useEffect } from 'react';
import { useAuth, useConsumos, useMunicipios, usePredicciones } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity,
  Zap,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import { CHART_COLORS } from '@/config/chart.config';
import { patternsService } from '@/services/ml/patterns';
import { timeseriesService } from '@/services/ml/timeseries';
import { predictorService } from '@/services/ml/predictor';

const Analytics = () => {
  const { profile } = useAuth();
  const { consumos, filters, setFilters } = useConsumos();
  const { municipios } = useMunicipios();
  const { predecirLocal } = usePredicciones();

  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('12'); // meses
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consumos.length > 0) {
      performAnalysis();
    }
  }, [consumos, selectedMunicipio, selectedPeriodo]);

  const performAnalysis = () => {
    setLoading(true);

    try {
      // Filtrar consumos por municipio si está seleccionado
      let dataToAnalyze = consumos;
      if (selectedMunicipio) {
        dataToAnalyze = consumos.filter((c) => c.municipio_id === parseInt(selectedMunicipio));
      }

      // Agrupar por mes
      const porMes = dataToAnalyze.reduce((acc, c) => {
        const key = `${c.anio}-${String(c.mes).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + Number(c.valor_kwh);
        return acc;
      }, {});

      // Convertir a array y ordenar
      const serieData = Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-parseInt(selectedPeriodo))
        .map(([fecha, valor]) => ({
          fecha,
          valor,
          mes: fecha.substring(5),
          anio: fecha.substring(0, 4),
        }));

      if (serieData.length < 3) {
        setAnalysisData({
          serie: serieData,
          tendencia: null,
          patrones: null,
          predicciones: null,
          estadisticas: null,
          alertas: [],
        });
        return;
      }

      const valores = serieData.map((d) => d.valor);

      // Detectar tendencia
      const tendencia = patternsService.detectarTendencia(valores);

      // Detectar patrones
      const picos = patternsService.detectarPicos(valores, 1.5);
      const ciclos = patternsService.detectarCiclos(valores, 3, 12);
      const mesPico = patternsService.mesConMayorConsumo(valores);

      // Análisis de series temporales
      const suavizado = timeseriesService.suavizadoExponencial(valores, 0.3);
      const acf = timeseriesService.calcularACF(
        valores,
        Math.min(12, Math.floor(valores.length / 2))
      );

      // Predicciones
      let predicciones = [];
      try {
        predicciones = predictorService.predecirConsumo(valores, 6);
      } catch (error) {
        console.error('Error en predicciones:', error);
      }

      // Estadísticas básicas
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      const maximo = Math.max(...valores);
      const minimo = Math.min(...valores);
      const desviacion = patternsService.calcularDesviacionEstandar(valores, promedio);
      const coeficienteVariacion = (desviacion / promedio) * 100;

      // Comparar último mes vs promedio
      const ultimoValor = valores[valores.length - 1];
      const variacionPromedio = ((ultimoValor - promedio) / promedio) * 100;

      // Generar alertas
      const alertas = [];
      if (Math.abs(variacionPromedio) > 20) {
        alertas.push({
          tipo: variacionPromedio > 0 ? 'warning' : 'info',
          mensaje: `Consumo ${
            variacionPromedio > 0 ? 'superior' : 'inferior'
          } al promedio en ${Math.abs(variacionPromedio).toFixed(1)}%`,
          severidad: Math.abs(variacionPromedio) > 30 ? 'alta' : 'media',
        });
      }

      if (picos.length > 0) {
        alertas.push({
          tipo: 'warning',
          mensaje: `${picos.length} pico${picos.length > 1 ? 's' : ''} de consumo detectado${
            picos.length > 1 ? 's' : ''
          }`,
          severidad: 'media',
        });
      }

      if (tendencia.tipo === 'creciente' && tendencia.pendiente > 500) {
        alertas.push({
          tipo: 'danger',
          mensaje: 'Tendencia creciente pronunciada detectada',
          severidad: 'alta',
        });
      }

      // Preparar datos para gráficos
      const chartData = serieData.map((d, i) => ({
        ...d,
        suavizado: suavizado[i],
        promedio: promedio,
      }));

      // Añadir predicciones al chart
      const ultimaFecha = new Date(serieData[serieData.length - 1].fecha + '-01');
      const prediccionesChart = predicciones.map((pred, i) => {
        const fecha = new Date(ultimaFecha);
        fecha.setMonth(fecha.getMonth() + i + 1);
        return {
          fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
          mes: String(fecha.getMonth() + 1).padStart(2, '0'),
          prediccion: pred.valor,
          min: pred.min,
          max: pred.max,
          esPrediccion: true,
        };
      });

      setAnalysisData({
        serie: chartData,
        prediccionesChart,
        tendencia,
        patrones: { picos, ciclos, mesPico },
        suavizado,
        acf,
        predicciones,
        estadisticas: {
          promedio,
          maximo,
          minimo,
          desviacion,
          coeficienteVariacion,
          ultimoValor,
          variacionPromedio,
        },
        alertas,
      });
    } catch (error) {
      console.error('Error in analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analysisData) return;

    // Exportar análisis a CSV
    const csvData = analysisData.serie.map((d) => ({
      Fecha: d.fecha,
      Consumo: d.valor,
      Suavizado: d.suavizado?.toFixed(2) || '',
      Promedio: d.promedio.toFixed(2),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTendenciaIcon = (tipo) => {
    if (tipo === 'creciente') return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    if (tipo === 'decreciente') return <ArrowDownRight className="w-5 h-5 text-green-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTendenciaColor = (tipo) => {
    if (tipo === 'creciente') return 'bg-red-100 text-red-800';
    if (tipo === 'decreciente') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Análisis Avanzado</h2>
              <p className="text-sm text-gray-600 mt-1">
                Análisis detallado de tendencias y patrones de consumo
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                className="min-w-[200px]"
              >
                <option value="">Todos los municipios</option>
                {municipios.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>

              <Select value={selectedPeriodo} onChange={(e) => setSelectedPeriodo(e.target.value)}>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Últimos 12 meses</option>
                <option value="24">Últimos 24 meses</option>
                <option value="36">Últimos 36 meses</option>
              </Select>

              <Button variant="outline" onClick={handleExport} disabled={!analysisData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !analysisData ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No hay datos suficientes para el análisis</p>
          <p className="text-sm text-gray-500 mt-1">Se necesitan al menos 3 registros mensuales</p>
        </Card>
      ) : (
        <>
          {/* Alertas */}
          {analysisData.alertas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Alertas del Análisis
                </h3>
                <div className="space-y-3">
                  {analysisData.alertas.map((alerta, index) => (
                    <div
                      key={index}
                      className={`
                        p-4 rounded-lg border flex items-start gap-3
                        ${alerta.tipo === 'danger' ? 'bg-red-50 border-red-200' : ''}
                        ${alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' : ''}
                        ${alerta.tipo === 'info' ? 'bg-blue-50 border-blue-200' : ''}
                      `}
                    >
                      <AlertCircle
                        className={`
                        w-5 h-5 flex-shrink-0 mt-0.5
                        ${alerta.tipo === 'danger' ? 'text-red-600' : ''}
                        ${alerta.tipo === 'warning' ? 'text-yellow-600' : ''}
                        ${alerta.tipo === 'info' ? 'text-blue-600' : ''}
                      `}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{alerta.mensaje}</p>
                        <Badge
                          className={`mt-1 ${
                            alerta.severidad === 'alta'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          Severidad: {alerta.severidad}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Estadísticas Clave */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Promedio */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Promedio</p>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analysisData.estadisticas.promedio, 1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">kWh por mes</p>
              </Card>

              {/* Variación */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Variación</p>
                  {analysisData.estadisticas.variacionPromedio > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p
                  className={`text-2xl font-bold ${
                    analysisData.estadisticas.variacionPromedio > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {analysisData.estadisticas.variacionPromedio > 0 ? '+' : ''}
                  {formatNumber(analysisData.estadisticas.variacionPromedio, 1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">vs promedio</p>
              </Card>

              {/* Máximo */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Máximo</p>
                  <ArrowUpRight className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analysisData.estadisticas.maximo, 1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">kWh</p>
              </Card>

              {/* Coeficiente de Variación */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Volatilidad</p>
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analysisData.estadisticas.coeficienteVariacion, 1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Coef. variación</p>
              </Card>
            </div>
          </motion.div>

          {/* Tendencia */}
          {analysisData.tendencia && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Análisis de Tendencia</h3>
                <div className="flex items-center gap-4">
                  <div
                    className={`p-4 rounded-lg ${getTendenciaColor(analysisData.tendencia.tipo)}`}
                  >
                    {getTendenciaIcon(analysisData.tendencia.tipo)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      Tendencia {analysisData.tendencia.tipo}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cambio estimado: {formatNumber(analysisData.tendencia.cambio, 1)}% por mes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Pendiente: {formatNumber(analysisData.tendencia.pendiente, 2)} kWh/mes
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Gráfico Principal: Serie Temporal con Predicciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Serie Temporal y Predicciones
                  </h3>
                  <p className="text-sm text-gray-600">
                    Histórico con suavizado exponencial y proyección a 6 meses
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Real
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Suavizado
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Predicción
                  </Badge>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={[...analysisData.serie, ...analysisData.prediccionesChart]}>
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
                      if (name === 'promedio') return [formatNumber(value, 0) + ' kWh', 'Promedio'];
                      if (name === 'valor')
                        return [formatNumber(value, 0) + ' kWh', 'Consumo Real'];
                      if (name === 'suavizado')
                        return [formatNumber(value, 0) + ' kWh', 'Suavizado'];
                      if (name === 'prediccion')
                        return [formatNumber(value, 0) + ' kWh', 'Predicción'];
                      return [formatNumber(value, 0) + ' kWh', name];
                    }}
                  />
                  <Legend />

                  {/* Línea de promedio */}
                  <ReferenceLine
                    y={analysisData.estadisticas.promedio}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label={{ value: 'Promedio', position: 'insideTopRight', fill: '#6b7280' }}
                  />

                  {/* Área de consumo real */}
                  <Area
                    type="monotone"
                    dataKey="valor"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    stroke="none"
                  />

                  {/* Línea de consumo real */}
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Consumo Real"
                    connectNulls={false}
                  />

                  {/* Línea suavizada */}
                  <Line
                    type="monotone"
                    dataKey="suavizado"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    name="Suavizado"
                  />

                  {/* Área de predicción */}
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

                  {/* Línea de predicción */}
                  <Line
                    type="monotone"
                    dataKey="prediccion"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 5 }}
                    strokeDasharray="8 4"
                    name="Predicción"
                  />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Interpretación del análisis:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>La línea azul muestra el consumo real histórico</li>
                      <li>
                        La línea verde punteada representa el suavizado exponencial que reduce el
                        ruido
                      </li>
                      <li>La línea morada muestra las predicciones para los próximos 6 meses</li>
                      <li>
                        El área sombreada morada representa el intervalo de confianza de las
                        predicciones
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Patrones Detectados */}
          {analysisData.patrones && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Picos y Anomalías */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Picos y Anomalías
                  </h3>

                  {analysisData.patrones.picos.length > 0 ? (
                    <div className="space-y-3">
                      {analysisData.patrones.picos.slice(0, 5).map((pico, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">Mes {pico.indice + 1}</p>
                            <p className="text-sm text-gray-600">
                              {formatNumber(pico.valor, 0)} kWh
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            {pico.tipo === 'pico_alto' ? '↑' : '↓'} {pico.desviacion.toFixed(1)}σ
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No se detectaron picos anómalos</p>
                    </div>
                  )}
                </Card>

                {/* Ciclos y Estacionalidad */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Ciclos y Estacionalidad
                  </h3>

                  {analysisData.patrones.ciclos.length > 0 ? (
                    <div className="space-y-3">
                      {analysisData.patrones.ciclos.map((ciclo, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              Ciclo de {ciclo.longitud} meses
                            </p>
                            <p className="text-sm text-gray-600">
                              Correlación: {(ciclo.correlacion * 100).toFixed(1)}%
                            </p>
                          </div>
                          {ciclo.fuerte && (
                            <Badge className="bg-purple-100 text-purple-800">Fuerte</Badge>
                          )}
                        </div>
                      ))}

                      {analysisData.patrones.mesPico && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Mes pico:</strong> {analysisData.patrones.mesPico.mes} (
                            {formatNumber(analysisData.patrones.mesPico.valor, 0)} kWh)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Info className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No se detectaron ciclos significativos</p>
                      <p className="text-sm mt-1">
                        Se necesitan más datos para identificar patrones estacionales
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}

          {/* Autocorrelación */}
          {analysisData.acf && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Función de Autocorrelación (ACF)
                    </h3>
                    <p className="text-sm text-gray-600">
                      Identifica patrones repetitivos en la serie temporal
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.acf}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="lag"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Lag (meses)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[-1, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                      formatter={(value) => [(value * 100).toFixed(1) + '%', 'Correlación']}
                    />
                    <ReferenceLine y={0} stroke="#9ca3af" />
                    <ReferenceLine y={0.2} stroke="#10b981" strokeDasharray="5 5" />
                    <ReferenceLine y={-0.2} stroke="#10b981" strokeDasharray="5 5" />
                    <Bar dataKey="correlacion" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Interpretación:</strong> Las barras que sobresalen de las líneas verdes
                    punteadas (±0.2) indican autocorrelación significativa. Esto sugiere que el
                    consumo de ese mes está relacionado con el consumo de X meses atrás, indicando
                    estacionalidad o ciclos.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recomendaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Recomendaciones Basadas en el Análisis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.tendencia?.tipo === 'creciente' && (
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Tendencia Creciente</p>
                        <p className="text-sm text-gray-600">
                          Se recomienda implementar medidas de eficiencia energética para controlar
                          el aumento del consumo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {analysisData.patrones?.picos.length > 2 && (
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Activity className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Picos Frecuentes</p>
                        <p className="text-sm text-gray-600">
                          Investiga las causas de los picos anómalos para optimizar el consumo
                          durante esos períodos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {analysisData.patrones?.ciclos.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Patrones Estacionales</p>
                        <p className="text-sm text-gray-600">
                          Planifica con anticipación para los meses de alto consumo basándote en los
                          ciclos detectados.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {analysisData.estadisticas?.coeficienteVariacion > 30 && (
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Alta Volatilidad</p>
                        <p className="text-sm text-gray-600">
                          El consumo es muy variable. Considera implementar sistemas de monitoreo en
                          tiempo real.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Analytics;
