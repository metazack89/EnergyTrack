import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, Table, FileSpreadsheet, Image, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} ExportButtonProps
 * @property {Array<Object>} data - Datos a exportar
 * @property {string} [filename] - Nombre del archivo
 * @property {Array<string>} [formats] - Formatos disponibles
 * @property {Function} [onExport] - Callback al exportar
 * @property {boolean} [loading] - Estado de carga
 */

const ExportButton = ({
  data = [],
  filename = 'export',
  formats = ['csv', 'json', 'xlsx'],
  onExport,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const formatOptions = {
    csv: {
      icon: Table,
      label: 'CSV',
      description: 'Excel compatible',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    json: {
      icon: FileText,
      label: 'JSON',
      description: 'Formato de datos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    xlsx: {
      icon: FileSpreadsheet,
      label: 'Excel',
      description: 'Hoja de cálculo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    png: {
      icon: Image,
      label: 'PNG',
      description: 'Imagen',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  };

  const exportToCSV = () => {
    if (!data.length) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((val) => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    if (!data.length) return;

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
  };

  const exportToExcel = () => {
    // Placeholder - requiere biblioteca como xlsx
    toast.info('Exportación a Excel próximamente');
  };

  const exportToPNG = () => {
    // Placeholder - requiere html2canvas
    toast.info('Exportación a PNG próximamente');
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      setExporting(true);

      // Callback personalizado
      if (onExport) {
        await onExport(format);
      } else {
        // Exportación por defecto
        switch (format) {
          case 'csv':
            exportToCSV();
            break;
          case 'json':
            exportToJSON();
            break;
          case 'xlsx':
            exportToExcel();
            break;
          case 'png':
            exportToPNG();
            break;
        }
      }

      toast.success(`Exportado como ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} disabled={loading || exporting} variant="outline">
        {exporting ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50"
            >
              <Card className="p-3 w-64 shadow-lg">
                <p className="text-xs font-medium text-gray-700 mb-3">Seleccionar formato</p>
                <div className="space-y-2">
                  {formats.map((format) => {
                    const config = formatOptions[format];
                    if (!config) return null;

                    return (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg ${config.bgColor} hover:opacity-80 transition-opacity`}
                      >
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-gray-900">{config.label}</p>
                          <p className="text-xs text-gray-600">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
                  {data.length} registros
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;
