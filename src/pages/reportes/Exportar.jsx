import { useState } from 'react';
import { useConsumos, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Table,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Exportar = () => {
  const { consumos } = useConsumos();
  const { municipios } = useMunicipios();

  const [config, setConfig] = useState({
    formato: 'csv',
    incluirEncabezados: true,
    municipio: '',
    limite: '1000',
  });

  const [exportando, setExportando] = useState(false);

  const formatos = [
    { id: 'csv', label: 'CSV', icon: Table, desc: 'Compatible con Excel' },
    { id: 'json', label: 'JSON', icon: FileText, desc: 'Formato de datos estructurado' },
    { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, desc: 'Hoja de cálculo nativa' },
  ];

  const exportarDatos = async () => {
    try {
      setExportando(true);

      let datos = consumos;
      if (config.municipio) {
        datos = datos.filter((c) => c.municipio_id === parseInt(config.municipio));
      }
      datos = datos.slice(0, parseInt(config.limite));

      if (datos.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      if (config.formato === 'csv') {
        exportarCSV(datos);
      } else if (config.formato === 'json') {
        exportarJSON(datos);
      } else {
        toast.info('Formato Excel próximamente');
      }

      toast.success(`${datos.length} registros exportados`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  const exportarCSV = (datos) => {
    const headers = ['ID', 'Año', 'Mes', 'Municipio', 'Fuente', 'Consumo (kWh)', 'Fecha Registro'];
    const rows = datos.map((c) => [
      c.id,
      c.anio,
      c.mes,
      c.municipios?.nombre || 'N/A',
      c.fuentes_energia?.tipo || 'N/A',
      c.valor_kwh,
      new Date(c.created_at).toLocaleDateString(),
    ]);

    const csv = config.incluirEncabezados
      ? [headers, ...rows].map((row) => row.join(',')).join('\n')
      : rows.map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consumos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarJSON = (datos) => {
    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consumos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Download className="w-8 h-8 text-primary-600" />
          Exportar Datos
        </h1>
        <p className="text-gray-600 mt-2">Descarga los datos en diferentes formatos</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configuración de Exportación</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio (Opcional)
              </label>
              <Select
                value={config.municipio}
                onChange={(e) => setConfig((prev) => ({ ...prev, municipio: e.target.value }))}
              >
                <option value="">Todos los municipios</option>
                {municipios.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Registros
              </label>
              <Select
                value={config.limite}
                onChange={(e) => setConfig((prev) => ({ ...prev, limite: e.target.value }))}
              >
                <option value="100">100 registros</option>
                <option value="500">500 registros</option>
                <option value="1000">1,000 registros</option>
                <option value="5000">5,000 registros</option>
                <option value={consumos.length}>Todos ({consumos.length})</option>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.incluirEncabezados}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, incluirEncabezados: e.target.checked }))
                  }
                />
                <span className="text-sm">Incluir encabezados</span>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Información</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Los datos se exportan en el formato seleccionado</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">CSV es compatible con Excel y Google Sheets</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">JSON es ideal para integración con APIs</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">Exportaciones grandes pueden tardar unos segundos</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Selecciona el Formato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatos.map((formato) => (
            <Card
              key={formato.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                config.formato === formato.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
              }`}
              onClick={() => setConfig((prev) => ({ ...prev, formato: formato.id }))}
            >
              <div className="flex items-center justify-between mb-3">
                <formato.icon
                  className={`w-8 h-8 ${
                    config.formato === formato.id ? 'text-primary-600' : 'text-gray-400'
                  }`}
                />
                {config.formato === formato.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{formato.label}</h4>
              <p className="text-sm text-gray-600">{formato.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Listo para Exportar</p>
            <p className="text-sm text-gray-600 mt-1">
              {config.municipio
                ? `Municipio seleccionado • ${config.limite} registros`
                : `Todos los municipios • ${config.limite} registros`}
            </p>
          </div>
          <Button onClick={exportarDatos} disabled={exportando} size="lg">
            {exportando ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Exportar {config.formato.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Exportar;
