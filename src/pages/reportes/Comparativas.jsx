import { useState, useEffect } from 'react';
import { useConsumos, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Zap,
  RefreshCw,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const Comparativas = () => {
  const { consumos } = useConsumos();
  const { municipios } = useMunicipios();

  const [municipiosSeleccionados, setMunicipiosSeleccionados] = useState([]);
  const [periodo, setPeriodo] = useState('12');
  const [datosComparativos, setDatosComparativos] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarComparativa = () => {
    if (municipiosSeleccionados.length < 2) {
      toast.error('Selecciona al menos 2 municipios');
      return;
    }

    try {
      setLoading(true);

      const datos = municipiosSeleccionados.map((munId) => {
        const consumosMuni = consumos
          .filter((c) => c.municipio_id === parseInt(munId))
          .slice(-parseInt(periodo));

        const total = consumosMuni.reduce((sum, c) => sum + Number(c.valor_kwh), 0);
        const promedio = total / consumosMuni.length;
        const maximo = Math.max(...consumosMuni.map((c) => Number(c.valor_kwh)));
        const minimo = Math.min(...consumosMuni.map((c) => Number(c.valor_kwh)));

        return {
          municipio: municipios.find((m) => m.id === parseInt(munId))?.nombre || 'Desconocido',
          total,
          promedio,
          maximo,
          minimo,
          registros: consumosMuni.length,
        };
      });

      setDatosComparativos(datos);
      toast.success('Comparativa generada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar comparativa');
    } finally {
      setLoading(false);
    }
  };

  const prepararDatosRadar = () => {
    if (!datosComparativos) return [];

    const maxTotal = Math.max(...datosComparativos.map((d) => d.total));
    const maxPromedio = Math.max(...datosComparativos.map((d) => d.promedio));

    return datosComparativos.map((d) => ({
      municipio: d.municipio.substring(0, 10),
      'Consumo Total': (d.total / maxTotal) * 100,
      Promedio: (d.promedio / maxPromedio) * 100,
      Registros: (d.registros / 12) * 100,
    }));
  };

  const handleMunicipioChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setMunicipiosSeleccionados(options);
  };

  const exportarDatos = () => {
    if (!datosComparativos) return;

    const csv = [
      ['Municipio', 'Total (kWh)', 'Promedio (kWh)', 'Máximo (kWh)', 'Mínimo (kWh)', 'Registros'],
      ...datosComparativos.map((d) => [
        d.municipio,
        d.total.toFixed(2),
        d.promedio.toFixed(2),
        d.maximo.toFixed(2),
        d.minimo.toFixed(2),
        d.registros,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparativa-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          Comparativas entre Municipios
        </h1>
        <p className="text-gray-600 mt-2">
          Analiza y compara el consumo energético entre diferentes municipios
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Configuración</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Municipios</label>
                <Select
                  multiple
                  value={municipiosSeleccionados}
                  onChange={handleMunicipioChange}
                  className="h-48"
                >
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 mt-1">Selecciona 2-5 municipios</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  <option value="6">Últimos 6 meses</option>
                  <option value="12">Último año</option>
                  <option value="24">Últimos 2 años</option>
                </Select>
              </div>

              <Button onClick={generarComparativa} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generar
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!datosComparativos ? (
            <Card className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona Municipios</h3>
              <p className="text-gray-600">Escoge al menos 2 municipios para comparar</p>
            </Card>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Comparando {datosComparativos.length} municipios
                  </p>
                  <Button variant="outline" size="sm" onClick={exportarDatos}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Consumo Total por Municipio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosComparativos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="municipio" />
                    <YAxis tickFormatter={(v) => formatNumber(v, 0)} />
                    <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Análisis Multidimensional</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={prepararDatosRadar()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="municipio" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Consumo Total"
                      dataKey="Consumo Total"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Promedio"
                      dataKey="Promedio"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {datosComparativos.map((dato, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{dato.municipio}</h4>
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-semibold">{formatNumber(dato.total, 0)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio</span>
                        <span className="font-semibold">{formatNumber(dato.promedio, 0)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registros</span>
                        <span className="font-semibold">{dato.registros}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comparativas;
