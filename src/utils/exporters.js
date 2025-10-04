/**
 * ============================================
 * EXPORTADORES
 * ============================================
 *
 * Funciones para exportar datos a diferentes formatos
 */

import { formatDate, formatNumber } from './formatters';
import { EXPORT_CONFIG } from './constants';

// ========================================
// EXPORTAR A CSV
// ========================================

/**
 * Convertir array de objetos a CSV
 *
 * @param {Array<Object>} data - Datos a exportar
 * @param {Array<string>} [columns] - Columnas a incluir (opcional)
 * @returns {string} Contenido CSV
 *
 * @example
 * const csv = arrayToCSV([
 *   {nombre: 'Juan', edad: 30},
 *   {nombre: 'María', edad: 25}
 * ])
 */
export const arrayToCSV = (data, columns = null) => {
  if (!data || data.length === 0) return '';

  // Obtener columnas
  const cols = columns || Object.keys(data[0]);

  // Crear header
  const header = cols.join(',');

  // Crear filas
  const rows = data.map((row) => {
    return cols
      .map((col) => {
        const value = row[col];
        // Escapar valores con comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
};

/**
 * Descargar CSV
 *
 * @param {Array<Object>} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 * @param {Array<string>} [columns] - Columnas a incluir
 *
 * @example
 * downloadCSV(consumos, 'consumos_enero_2024')
 */
export const downloadCSV = (data, filename, columns = null) => {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// ========================================
// EXPORTAR A EXCEL
// ========================================

/**
 * Convertir datos a formato Excel (usando SheetJS si está disponible)
 *
 * @param {Array<Object>} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 * @param {string} [sheetName='Datos'] - Nombre de la hoja
 *
 * @example
 * downloadExcel(consumos, 'reporte_consumos', 'Consumos Enero')
 */
export const downloadExcel = async (data, filename, sheetName = 'Datos') => {
  // Verificar si SheetJS está disponible
  if (typeof window.XLSX === 'undefined') {
    console.error('SheetJS no está disponible. Exportando a CSV en su lugar.');
    return downloadCSV(data, filename);
  }

  const XLSX = window.XLSX;

  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Añadir hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Descargar archivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Exportar múltiples hojas a Excel
 *
 * @param {Array<Object>} sheets - Array de {name, data}
 * @param {string} filename - Nombre del archivo
 *
 * @example
 * downloadExcelMultiSheet([
 *   {name: 'Consumos', data: consumos},
 *   {name: 'Municipios', data: municipios}
 * ], 'reporte_completo')
 */
export const downloadExcelMultiSheet = (sheets, filename) => {
  if (typeof window.XLSX === 'undefined') {
    console.error('SheetJS no está disponible');
    return;
  }

  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ========================================
// EXPORTAR A JSON
// ========================================

/**
 * Descargar JSON
 *
 * @param {Object|Array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 * @param {boolean} [pretty=true] - Formatear JSON
 *
 * @example
 * downloadJSON(consumos, 'consumos_backup')
 */
export const downloadJSON = (data, filename, pretty = true) => {
  const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);

  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// ========================================
// EXPORTAR A PDF
// ========================================

/**
 * Generar PDF básico (requiere jsPDF)
 *
 * @param {Object} options - Opciones del PDF
 * @param {string} options.title - Título del documento
 * @param {Array<Object>} options.data - Datos a incluir
 * @param {Array<string>} options.columns - Columnas de la tabla
 * @param {string} options.filename - Nombre del archivo
 *
 * @example
 * downloadPDF({
 *   title: 'Reporte de Consumos',
 *   data: consumos,
 *   columns: ['fecha', 'municipio', 'consumo'],
 *   filename: 'reporte_consumos'
 * })
 */
export const downloadPDF = async ({ title, data, columns, filename, orientation = 'portrait' }) => {
  // Verificar si jsPDF está disponible
  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF no está disponible');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF(orientation);

  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date(), 'medium')}`, 14, 30);

  // Si hay plugin autoTable, crear tabla
  if (doc.autoTable) {
    const tableData = data.map((row) => columns.map((col) => row[col] ?? ''));

    doc.autoTable({
      head: [columns],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });
  } else {
    // Texto simple si no hay autoTable
    let y = 40;
    data.forEach((row) => {
      const text = columns.map((col) => `${col}: ${row[col]}`).join(' | ');
      doc.text(text, 14, y);
      y += 10;
    });
  }

  // Descargar
  doc.save(`${filename}.pdf`);
};

// ========================================
// HELPERS GENERALES
// ========================================

/**
 * Preparar datos para exportación
 * Limpia y formatea datos según el tipo de exportación
 *
 * @param {Array<Object>} data - Datos originales
 * @param {Object} columnMapping - Mapeo de columnas {keyOriginal: 'Nombre Legible'}
 * @returns {Array<Object>} Datos preparados
 *
 * @example
 * const prepared = prepareDataForExport(consumos, {
 *   valor_kwh: 'Consumo (kWh)',
 *   created_at: 'Fecha Registro'
 * })
 */
export const prepareDataForExport = (data, columnMapping) => {
  return data.map((row) => {
    const newRow = {};

    Object.keys(columnMapping).forEach((key) => {
      const newKey = columnMapping[key];
      let value = row[key];

      // Formatear según tipo
      if (value instanceof Date) {
        value = formatDate(value);
      } else if (typeof value === 'number') {
        value = formatNumber(value, 2);
      } else if (typeof value === 'object' && value !== null) {
        // Para objetos anidados, tomar un campo representativo
        value = value.nombre || value.tipo || JSON.stringify(value);
      }

      newRow[newKey] = value;
    });

    return newRow;
  });
};

/**
 * Exportar datos automático según formato
 *
 * @param {Array<Object>} data - Datos
 * @param {string} format - Formato: 'csv' | 'excel' | 'json' | 'pdf'
 * @param {string} filename - Nombre del archivo
 * @param {Object} [options] - Opciones adicionales
 *
 * @example
 * exportData(consumos, 'excel', 'reporte_consumos')
 */
export const exportData = async (data, format, filename, options = {}) => {
  // Validar cantidad de datos
  if (data.length > EXPORT_CONFIG.MAX_ROWS) {
    throw new Error(`No se pueden exportar más de ${EXPORT_CONFIG.MAX_ROWS} registros`);
  }

  // Añadir prefijo al nombre
  const fullFilename = `${EXPORT_CONFIG.FILENAME_PREFIX}${filename}`;

  switch (format.toLowerCase()) {
    case 'csv':
      return downloadCSV(data, fullFilename, options.columns);

    case 'excel':
      return downloadExcel(data, fullFilename, options.sheetName);

    case 'json':
      return downloadJSON(data, fullFilename, options.pretty);

    case 'pdf':
      return downloadPDF({
        title: options.title || 'Reporte',
        data,
        columns: options.columns || Object.keys(data[0]),
        filename: fullFilename,
        orientation: options.orientation,
      });

    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
};

/**
 * Copiar datos al portapapeles
 *
 * @param {Array<Object>} data - Datos
 * @param {string} [format='csv'] - Formato
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export const copyToClipboard = async (data, format = 'csv') => {
  try {
    let text = '';

    if (format === 'csv') {
      text = arrayToCSV(data);
    } else if (format === 'json') {
      text = JSON.stringify(data, null, 2);
    }

    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
};
