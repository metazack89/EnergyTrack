import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Zap,
  Leaf,
  BarChart3,
  ArrowRight,
  Info,
  MapPin,
  Activity,
  Target,
  Users,
  Sun,
  Wind,
  Droplet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/utils';

const PublicDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos públicos
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Datos de ejemplo para dashboard público
  const consumoTotal = {
    actual: 245680,
    anterior: 232150,
    variacion: 5.8,
  };

  const tendenciaMensual = [
    { mes: 'Jul', consumo: 18500 },
    { mes: 'Ago', consumo: 19200 },
    { mes: 'Sep', consumo: 20100 },
    { mes: 'Oct', consumo: 19800 },
    { mes: 'Nov', consumo: 21300 },
    { mes: 'Dic', consumo: 22400 },
  ];

  const porFuente = [
    { tipo: 'Eléctrica', valor: 45, color: '#3b82f6' },
    { tipo: 'Solar', valor: 25, color: '#f59e0b' },
    { tipo: 'Eólica', valor: 18, color: '#10b981' },
    { tipo: 'Hidroeléctrica', valor: 12, color: '#06b6d4' },
  ];

  const municipiosDestacados = [
    { nombre: 'Bucaramanga', consumo: 45200, variacion: 3.2 },
    { nombre: 'Floridablanca', consumo: 38900, variacion: -1.5 },
    { nombre: 'Girón', consumo: 32100, variacion: 4.8 },
    { nombre: 'Piedecuesta', consumo: 28400, variacion: 2.1 },
  ];

  const estadisticas = [
    {
      label: 'Consumo Total',
      value: formatNumber(consumoTotal.actual, 0),
      unit: 'kWh',
      icon: Zap,
      color: 'blue',
    },
    { label: 'Municipios', value: '92', unit: 'registrados', icon: MapPin, color: 'green' },
    { label: 'Fuentes', value: '4', unit: 'tipos', icon: Activity, color: 'purple' },
    { label: 'Usuarios', value: '1,234', unit: 'activos', icon: Users, color: 'orange' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EnergyTrack</h1>
                <p className="text-xs text-gray-600">Dashboard Público</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/about">
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  Acerca de
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Monitoreo Energético en Tiempo Real
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualiza el consumo energético de Santander de forma transparente y accesible
          </p>
        </motion.div>

        {/* Estadísticas Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {estadisticas.map((stat, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  <Badge variant="outline" className={`text-${stat.color}-700`}>
                    {stat.unit}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Consumo Total con Variación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Consumo Total del Mes</p>
                <p className="text-5xl font-bold mb-2">
                  {formatNumber(consumoTotal.actual, 0)} kWh
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-lg">+{consumoTotal.variacion}% vs mes anterior</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Zap className="w-16 h-16" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tendencia Mensual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tendencia de Consumo (6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendenciaMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                  <Line
                    type="monotone"
                    dataKey="consumo"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Distribución por Fuente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fuentes de Energía</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={porFuente}
                    dataKey="valor"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.valor}%`}
                  >
                    {porFuente.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {porFuente.map((fuente, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: fuente.color }}
                      ></div>
                      <span className="text-gray-700">{fuente.tipo}</span>
                    </div>
                    <span className="font-semibold">{fuente.valor}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Municipios Destacados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Municipios por Consumo</h3>
            <div className="space-y-4">
              {municipiosDestacados.map((muni, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{muni.nombre}</p>
                      <p className="text-sm text-gray-600">{formatNumber(muni.consumo, 0)} kWh</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      muni.variacion > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }
                  >
                    {muni.variacion > 0 ? '+' : ''}
                    {muni.variacion}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Información de Fuentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Sun, title: 'Energía Solar', desc: 'Paneles fotovoltaicos', color: 'orange' },
              { icon: Wind, title: 'Energía Eólica', desc: 'Parques eólicos', color: 'blue' },
              { icon: Droplet, title: 'Hidroeléctrica', desc: 'Centrales hídricas', color: 'cyan' },
            ].map((fuente, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
                <fuente.icon className={`w-12 h-12 mx-auto mb-3 text-${fuente.color}-600`} />
                <h4 className="font-semibold text-gray-900 mb-1">{fuente.title}</h4>
                <p className="text-sm text-gray-600">{fuente.desc}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8 bg-gradient-to-r from-primary-500 to-purple-600 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">¿Quieres acceder a más datos?</h3>
            <p className="text-blue-100 mb-6">
              Regístrate para ver análisis detallados, predicciones y reportes personalizados
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/auth/register">
                <Button variant="outline" className="bg-white text-primary-600 hover:bg-blue-50">
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600">
            Datos actualizados en tiempo real • EnergyTrack Colombia 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
