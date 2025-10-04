import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para exportar datos a diferentes formatos
 * Soporta CSV, JSON, Excel y copiar al portapapeles
 *
 * @example
 * const { exportToCSV, exportToJSON, exporting } = useExport()
 *
 * exportToCSV(data, 'consumos.csv')
 * exportToJSON(data, 'consumos.json')
 */
export const useExport = () => {
  const [exporting, setExporting] = useState(false);

  /**
   * Exportar datos a CSV
   * @param {Array<Object>} data - Array de objetos a exportar
   * @param {string} filename - Nombre del archivo
   */
  const exportToCSV = (data, filename = 'export.csv') => {
    try {
      setExporting(true);

      if (!data || data.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      // Convertir array de objetos a CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header] !== null && row[header] !== undefined ? row[header] : '';
              // Escapar comas y comillas
              const escaped = String(value).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(',')
        ),
      ].join('\n');

      // Agregar BOM para UTF-8
      const bom = '\uFEFF';
      const csvWithBom = bom + csvContent;

      // Crear blob y descargar
      const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportado a CSV exitosamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar CSV');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Exportar datos a JSON
   * @param {any} data - Datos a exportar
   * @param {string} filename - Nombre del archivo
   */
  const exportToJSON = (data, filename = 'export.json') => {
    try {
      setExporting(true);

      if (!data) {
        toast.error('No hay datos para exportar');
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportado a JSON exitosamente');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Error al exportar JSON');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Exportar tabla HTML a Excel
   * @param {string} tableId - ID de la tabla HTML
   * @param {string} filename - Nombre del archivo
   */
  const exportToExcel = (tableId, filename = 'export.xlsx') => {
    try {
      setExporting(true);

      const table = document.getElementById(tableId);
      if (!table) {
        toast.error('Tabla no encontrada');
        return;
      }

      // Crear un libro de trabajo simple usando HTML table
      const html = table.outerHTML;
      const blob = new Blob([html], {
        type: 'application/vnd.ms-excel',
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportado a Excel exitosamente');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Error al exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Copiar datos al portapapeles
   * @param {any} data - Datos a copiar
   */
  const copyToClipboard = async (data) => {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Copiado al portapapeles');
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          toast.success('Copiado al portapapeles');
        } catch (err) {
          toast.error('Error al copiar');
        }

        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar');
    }
  };

  /**
   * Descargar archivo desde URL
   * @param {string} url - URL del archivo
   * @param {string} filename - Nombre del archivo
   */
  const downloadFromURL = async (url, filename) => {
    try {
      setExporting(true);

      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success('Descargado exitosamente');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error al descargar archivo');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Imprimir contenido
   * @param {string} elementId - ID del elemento a imprimir
   */
  const printElement = (elementId) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error('Elemento no encontrado');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imprimir</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Error al imprimir');
    }
  };

  return {
    exporting,
    exportToCSV,
    exportToJSON,
    exportToExcel,
    copyToClipboard,
    downloadFromURL,
    printElement,
  };
};
