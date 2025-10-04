import { useState, useEffect } from 'react';
import { useAuth, useConsumos, useMunicipios, useFuentesEnergia } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  Zap,
  Filter,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Printer,
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
import toast from 'react-hot-toast';

const Reportes = () => {
  const { profile } = useAuth();
  const { consumos } = useConsumos();
  const { municipios } = useMunicipios();
  const { fuentes } = useFuentesEnergia();

  const [config, setConfig] = useState({
    titulo: 'Reporte de Consumo Energético',
    fechaInicio: '',
    fechaFin: '',
    municipios: [],
    fuentes: [],
    tipoReporte: 'general',
    incluirGraficos: true,
    incluirTablas: true,
    formato: 'pdf',
  });

  const [datosReporte, setDatosReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(hoy.getFullYear() - 1);
    setConfig((prev) => ({
      ...prev,
      fechaInicio: haceUnAnio.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0],
    }));
  }, []);

  const generarReporte = () => {
    if (!config.fechaInicio || !config.fechaFin) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    try {
      setLoading(true);

      let consumosFiltrados = consumos.filter((c) => {
        const fechaConsumo = new Date(c.anio, c.mes - 1);
        const inicio = new Date(config.fechaInicio);
        const fin = new Date(config.fechaFin);
        const dentroRango = fechaConsumo >= inicio && fechaConsumo <= fin;
        const municipioValido =
          config.municipios.length === 0 || config.municipios.includes(c.municipio_id?.toString());
        const fuenteValida =
          config.fuentes.length === 0 || config.fuentes.includes(c.fuente_id?.toString());
        return dentroRango && municipioValido && fuenteValida;
      });

      if (consumosFiltrados.length === 0) {
        toast.error('No hay datos para los filtros seleccionados');
        return;
      }

      const stats = calcularEstadisticas(consumosFiltrados);
      const chartData = prepararDatosGraficos(consumosFiltrados);

      setDatosReporte({
        consumos: consumosFiltrados,
        estadisticas: stats,
        graficos: chartData,
        configuracion: { ...config },
        generadoEn: new Date(),
        generadoPor: profile,
      });

      setVistaPrevia(true);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data) => {
    const total = data.reduce((sum, c) => sum + Number(c.valor_kwh), 0);
    const promedio = total / data.length;
    const porMunicipio = {};
    const porFuente = {};

    data.forEach((c) => {
      const nombreMuni = c.municipios?.nombre || 'Sin municipio';
      const tipoFuente = c.fuentes_energia?.tipo || 'Sin fuente';
      porMunicipio[nombreMuni] = (porMunicipio[nombreMuni] || 0) + Number(c.valor_kwh);
      porFuente[tipoFuente] = (porFuente[tipoFuente] || 0) + Number(c.valor_kwh);
    });

    return {
      total,
      promedio,
      registros: data.length,
      porMunicipio,
      porFuente,
    };
  };

  const prepararDatosGraficos = (data) => {
    const porMes = {};
    data.forEach((c) => {
      const key = `${c.anio}-${String(c.mes).padStart(2, '0')}`;
      porMes[key] = (porMes[key] || 0) + Number(c.valor_kwh);
    });

    const tendencia = Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, valor]) => ({ fecha, valor }));

    return { tendencia };
  };

  const exportarPDF = () => {
    toast.info('Generando PDF...');
    setTimeout(() => {
      const contenido = document.getElementById('reporte-preview');
      if (contenido) {
        window.print();
        toast.success('PDF generado');
      }
    }, 500);
  };

  const exportarCSV = () => {
    if (!datosReporte) return;

    const csv = [
      ['Fecha', 'Municipio', 'Fuente', 'Consumo (kWh)'],
      ...datosReporte.consumos.map((c) => [
        `${c.anio}-${String(c.mes).padStart(2, '0')}`,
        c.municipios?.nombre || 'N/A',
        c.fuentes_energia?.tipo || 'N/A',
        c.valor_kwh,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-600" />
          Generador de Reportes
        </h1>
        <p className="text-gray-600 mt-2">Crea reportes personalizados de consumo energético</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de configuración */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              Configuración
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <Input
                  value={config.titulo}
                  onChange={(e) => handleConfigChange('titulo', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <Input
                  type="date"
                  value={config.fechaInicio}
                  onChange={(e) => handleConfigChange('fechaInicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <Input
                  type="date"
                  value={config.fechaFin}
                  onChange={(e) => handleConfigChange('fechaFin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Municipios</label>
                <Select
                  multiple
                  value={config.municipios}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions);
                    handleConfigChange(
                      'municipios',
                      options.map((o) => o.value)
                    );
                  }}
                  className="h-32"
                >
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <Select
                  value={config.tipoReporte}
                  onChange={(e) => handleConfigChange('tipoReporte', e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="comparativo">Comparativo</option>
                  <option value="detallado">Detallado</option>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.incluirGraficos}
                    onChange={(e) => handleConfigChange('incluirGraficos', e.target.checked)}
                  />
                  <span className="text-sm">Incluir gráficos</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.incluirTablas}
                    onChange={(e) => handleConfigChange('incluirTablas', e.target.checked)}
                  />
                  <span className="text-sm">Incluir tablas</span>
                </label>
              </div>

              <Button onClick={generarReporte} disabled={loading} className="w-full mt-4">
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Generar Vista Previa
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-2">
          {!vistaPrevia ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Configura tu Reporte</h3>
              <p className="text-gray-600">Selecciona los parámetros y genera la vista previa</p>
            </Card>
          ) : (
            datosReporte && (
              <div className="space-y-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Reporte listo</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportarPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportarCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <div id="reporte-preview">
                  <Card className="p-8 mb-6">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{config.titulo}</h1>
                      <p className="text-gray-600">
                        Período: {formatDate(config.fechaInicio)} - {formatDate(config.fechaFin)}
                      </p>
                      <Badge className="mt-2">{config.tipoReporte}</Badge>
                    </div>

                    <div className="border-t pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Generado por:</p>
                          <p className="font-medium">
                            {datosReporte.generadoPor?.full_name || 'Usuario'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fecha:</p>
                          <p className="font-medium">{formatDate(datosReporte.generadoEn)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Registros:</p>
                          <p className="font-medium">{datosReporte.estadisticas.registros}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total:</p>
                          <p className="font-medium">
                            {formatNumber(datosReporte.estadisticas.total, 0)} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Estadísticas Generales</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Total', value: datosReporte.estadisticas.total, suffix: 'kWh' },
                        {
                          label: 'Promedio',
                          value: datosReporte.estadisticas.promedio,
                          suffix: 'kWh',
                        },
                        {
                          label: 'Registros',
                          value: datosReporte.estadisticas.registros,
                          suffix: '',
                        },
                      ].map((stat, i) => (
                        <div key={i} className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatNumber(stat.value, 0)}
                          </p>
                          <p className="text-xs text-blue-600">{stat.suffix}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {config.incluirGraficos && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Tendencia Temporal</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={datosReporte.graficos.tendencia}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis tickFormatter={(v) => formatNumber(v, 0)} />
                          <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                          <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
