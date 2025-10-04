import { useState, useEffect } from 'react';
import { useAuth, useConsumos, useMunicipios, useAlertas } from '@/hooks';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Calendar,
  ArrowRight,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Droplets,
  Sun,
  Wind,
  Power,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import { CHART_COLORS } from '@/config/chart.config';

const Overview = () => {
  const { profile } = useAuth();
  const { consumos, getEstadisticas } = useConsumos();
  const { municipios } = useMunicipios();
  const { alertasActivas } = useAlertas();

  const [stats, setStats] = useState(null);
  const [tendenciaData, setTendenciaData] = useState([]);
  const [fuentesData, setFuentesData] = useState([]);

  useEffect(() => {
    if (consumos.length > 0) {
      const estadisticas = getEstadisticas();
      setStats(estadisticas);

      // Preparar datos para gráfico de tendencia (últimos 12 meses)
      if (estadisticas?.porMes) {
        const mesesData = Object.entries(estadisticas.porMes)
          .slice(-12)
          .map(([mes, valor]) => ({
            mes: mes.substring(5), // Solo MM
            valor: valor,
            fecha: mes,
          }));
        setTendenciaData(mesesData);
      }

      // Preparar datos para gráfico de fuentes
      if (estadisticas?.porFuente) {
        const fuentesArray = Object.entries(estadisticas.porFuente).map(([tipo, valor]) => ({
          tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          valor: valor,
          porcentaje: ((valor / estadisticas.total) * 100).toFixed(1),
        }));
        setFuentesData(fuentesArray);
      }
    }
  }, [consumos]);

  // Calcular variación vs mes anterior
  const calcularVariacion = () => {
    if (tendenciaData.length < 2) return null;

    const ultimo = tendenciaData[tendenciaData.length - 1].valor;
    const penultimo = tendenciaData[tendenciaData.length - 2].valor;
    const variacion = ((ultimo - penultimo) / penultimo) * 100;

    return {
      valor: variacion,
      positivo: variacion > 0,
    };
  };

  const variacion = calcularVariacion();

  // Colores para el gráfico de torta
  const COLORS = [
    CHART_COLORS.energy.electrica,
    CHART_COLORS.energy.solar,
    CHART_COLORS.energy.eolica,
    CHART_COLORS.energy.hidroelectrica,
    CHART_COLORS.energy.biomasa,
  ];

  // Iconos por tipo de fuente
  const getFuenteIcon = (tipo) => {
    const icons = {
      Electrica: Power,
      Solar: Sun,
      Eolica: Wind,
      Hidroelectrica: Droplets,
      Biomasa: Activity,
    };
    return icons[tipo] || Zap;
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Consumo Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              {variacion && (
                <Badge
                  className={
                    variacion.positivo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }
                >
                  {variacion.positivo ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(variacion.valor).toFixed(1)}%
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Consumo Total</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? formatNumber(stats.total, 0) : '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">kWh registrados</p>
          </Card>
        </motion.div>

        {/* Promedio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Promedio</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? formatNumber(stats.promedio, 1) : '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">kWh por registro</p>
          </Card>
        </motion.div>

        {/* Alertas Activas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/alertas">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                {alertasActivas.length > 0 && (
                  <Badge className="bg-red-500 text-white">{alertasActivas.length}</Badge>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Alertas Activas</h3>
              <p className="text-3xl font-bold text-gray-900">{alertasActivas.length}</p>
              <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
            </Card>
          </Link>
        </motion.div>

        {/* Municipios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Municipios</h3>
            <p className="text-3xl font-bold text-gray-900">{municipios.length}</p>
            <p className="text-xs text-gray-500 mt-1">Registrados</p>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Consumo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tendencia de Consumo</h3>
                <p className="text-sm text-gray-600">Últimos 12 meses</p>
              </div>
              <Link to="/dashboard/analytics">
                <Button variant="ghost" size="sm">
                  Ver más
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {tendenciaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendenciaData}>
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
                    formatter={(value) => [formatNumber(value, 0) + ' kWh', 'Consumo']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Consumo (kWh)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>
        </motion.div>

        {/* Distribución por Fuente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Fuente</h3>
                <p className="text-sm text-gray-600">Consumo total por tipo</p>
              </div>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            {fuentesData.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {/* Gráfico de torta */}
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={fuentesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {fuentesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Leyenda personalizada */}
                <div className="flex flex-col justify-center space-y-3">
                  {fuentesData.map((fuente, index) => {
                    const Icon = getFuenteIcon(fuente.tipo);
                    return (
                      <div key={fuente.tipo} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <Icon className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{fuente.tipo}</p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(fuente.valor, 0)} kWh ({fuente.porcentaje}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Alertas Recientes y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
                <p className="text-sm text-gray-600">Últimas notificaciones</p>
              </div>
              <Link to="/alertas">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {alertasActivas.slice(0, 5).length > 0 ? (
                alertasActivas.slice(0, 5).map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`
                      p-2 rounded-lg
                      ${alerta.severidad === 'critica' ? 'bg-red-100' : ''}
                      ${alerta.severidad === 'alta' ? 'bg-orange-100' : ''}
                      ${alerta.severidad === 'media' ? 'bg-yellow-100' : ''}
                      ${alerta.severidad === 'baja' ? 'bg-blue-100' : ''}
                    `}
                    >
                      <AlertTriangle
                        className={`
                        w-5 h-5
                        ${alerta.severidad === 'critica' ? 'text-red-600' : ''}
                        ${alerta.severidad === 'alta' ? 'text-orange-600' : ''}
                        ${alerta.severidad === 'media' ? 'text-yellow-600' : ''}
                        ${alerta.severidad === 'baja' ? 'text-blue-600' : ''}
                      `}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={`
                          ${alerta.severidad === 'critica' ? 'bg-red-100 text-red-800' : ''}
                          ${alerta.severidad === 'alta' ? 'bg-orange-100 text-orange-800' : ''}
                          ${alerta.severidad === 'media' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${alerta.severidad === 'baja' ? 'bg-blue-100 text-blue-800' : ''}
                        `}
                        >
                          {alerta.tipo.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(alerta.created_at, 'short')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{alerta.mensaje}</p>
                      {alerta.municipios && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alerta.municipios.nombre}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No hay alertas activas</p>
                  <p className="text-sm">Todo funciona correctamente</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>

            <div className="space-y-3">
              <Link to="/consumos/nuevo">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Consumo
                </Button>
              </Link>

              <Link to="/predicciones">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Predicciones
                </Button>
              </Link>

              <Link to="/reportes">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
              </Link>

              <Link to="/consumos">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Historial
                </Button>
              </Link>

              {profile?.role === 'admin' && (
                <Link to="/admin/usuarios">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar Usuarios
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Necesitas ayuda con el análisis de datos?
              </h3>
              <p className="text-sm text-gray-600">
                Explora nuestras herramientas de predicción y análisis avanzado para tomar mejores
                decisiones.
              </p>
            </div>
            <Link to="/dashboard/analytics">
              <Button>
                Ver Análisis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Overview;
