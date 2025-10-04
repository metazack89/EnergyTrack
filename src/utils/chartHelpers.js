/**
 * ============================================
 * HELPERS PARA GRÁFICOS
 * ============================================
 *
 * Utilidades para preparar datos de gráficos
 */

import { CHART_COLORS, CHART_PALETTE } from './constants';
import { formatNumber } from './formatters';

// ========================================
// PREPARACIÓN DE DATOS
// ========================================

/**
 * Agrupar datos por campo
 *
 * @param {Array<Object>} data - Datos a agrupar
 * @param {string} key - Campo por el cual agrupar
 * @returns {Object} Datos agrupados
 *
 * @example
 * groupBy([{mes: 1, valor: 100}, {mes: 1, valor: 200}], 'mes')
 * // {1: [{mes: 1, valor: 100}, {mes: 1, valor: 200}]}
 */
export const groupBy = (data, key) => {
  return data.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};

/**
 * Sumar valores agrupados
 *
 * @param {Array<Object>} data - Datos a sumar
 * @param {string} groupKey - Campo para agrupar
 * @param {string} valueKey - Campo a sumar
 * @returns {Array<Object>} Datos sumados
 */
export const sumByGroup = (data, groupKey, valueKey) => {
  const grouped = groupBy(data, groupKey);

  return Object.keys(grouped).map((key) => ({
    [groupKey]: key,
    [valueKey]: grouped[key].reduce((sum, item) => sum + item[valueKey], 0),
  }));
};

/**
 * Promediar valores agrupados
 *
 * @param {Array<Object>} data - Datos
 * @param {string} groupKey - Campo para agrupar
 * @param {string} valueKey - Campo a promediar
 * @returns {Array<Object>} Datos promediados
 */
export const averageByGroup = (data, groupKey, valueKey) => {
  const grouped = groupBy(data, groupKey);

  return Object.keys(grouped).map((key) => ({
    [groupKey]: key,
    [valueKey]: grouped[key].reduce((sum, item) => sum + item[valueKey], 0) / grouped[key].length,
  }));
};

/**
 * Completar datos faltantes con valor por defecto
 *
 * @param {Array<Object>} data - Datos
 * @param {Array} expectedKeys - Keys esperados
 * @param {string} keyField - Campo de la key
 * @param {string} valueField - Campo del valor
 * @param {any} [defaultValue=0] - Valor por defecto
 * @returns {Array<Object>} Datos completos
 */
export const fillMissingData = (data, expectedKeys, keyField, valueField, defaultValue = 0) => {
  const dataMap = new Map(data.map((item) => [item[keyField], item[valueField]]));

  return expectedKeys.map((key) => ({
    [keyField]: key,
    [valueField]: dataMap.get(key) ?? defaultValue,
  }));
};

// ========================================
// TRANSFORMACIONES
// ========================================

/**
 * Convertir datos a formato de serie temporal
 *
 * @param {Array<Object>} data - Datos
 * @param {string} dateKey - Campo de fecha
 * @param {string} valueKey - Campo de valor
 * @returns {Array<Object>} [{fecha, valor}]
 */
export const toTimeSeries = (data, dateKey, valueKey) => {
  return data.map((item) => ({
    fecha: item[dateKey],
    valor: item[valueKey],
  }));
};

/**
 * Convertir datos a formato para gráfico de torta
 *
 * @param {Array<Object>} data - Datos
 * @param {string} nameKey - Campo del nombre
 * @param {string} valueKey - Campo del valor
 * @returns {Array<Object>} [{name, value}]
 */
export const toPieChartData = (data, nameKey, valueKey) => {
  return data.map((item) => ({
    name: item[nameKey],
    value: item[valueKey],
  }));
};

/**
 * Calcular porcentajes para gráfico de torta
 *
 * @param {Array<Object>} data - Datos con valores
 * @param {string} [valueKey='value'] - Campo del valor
 * @returns {Array<Object>} Datos con porcentajes
 */
export const calculatePiePercentages = (data, valueKey = 'value') => {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);

  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? (item[valueKey] / total) * 100 : 0,
  }));
};

// ========================================
// COLORES Y ESTILOS
// ========================================

/**
 * Obtener color por índice
 *
 * @param {number} index - Índice
 * @returns {string} Color hex
 */
export const getColorByIndex = (index) => {
  return CHART_PALETTE[index % CHART_PALETTE.length];
};

/**
 * Asignar colores a datos
 *
 * @param {Array<Object>} data - Datos
 * @returns {Array<Object>} Datos con colores
 */
export const assignColors = (data) => {
  return data.map((item, index) => ({
    ...item,
    color: getColorByIndex(index),
  }));
};

/**
 * Obtener gradiente de colores
 *
 * @param {number} count - Cantidad de colores
 * @param {string} [startColor] - Color inicial
 * @param {string} [endColor] - Color final
 * @returns {Array<string>} Array de colores
 */
export const getColorGradient = (
  count,
  startColor = CHART_COLORS.primary,
  endColor = CHART_COLORS.secondary
) => {
  // Implementación simplificada
  return Array.from({ length: count }, (_, i) => getColorByIndex(i));
};

// ========================================
// FORMATEO PARA TOOLTIPS
// ========================================

/**
 * Formatear tooltip para gráfico de líneas
 *
 * @param {Object} payload - Datos del tooltip
 * @returns {string} HTML del tooltip
 */
export const formatLineTooltip = (payload) => {
  if (!payload || !payload.length) return '';

  const data = payload[0].payload;
  return `
    <div class="custom-tooltip">
      <p class="label">${data.fecha}</p>
      <p class="value">${formatNumber(data.valor, 0)} kWh</p>
    </div>
  `;
};

/**
 * Formatear etiqueta de eje Y
 *
 * @param {number} value - Valor
 * @returns {string} Valor formateado
 */
export const formatYAxisLabel = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return formatNumber(value, 0);
};

// ========================================
// CÁLCULOS ESTADÍSTICOS
// ========================================

/**
 * Calcular media móvil
 *
 * @param {Array<number>} data - Datos
 * @param {number} window - Ventana de la media
 * @returns {Array<number>} Media móvil
 */
export const calculateMovingAverage = (data, window) => {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(avg);
  }

  return result;
};

/**
 * Detectar outliers usando IQR
 *
 * @param {Array<number>} data - Datos
 * @returns {Object} {outliers, cleaned}
 */
export const detectOutliers = (data) => {
  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return {
    outliers: data.filter((val) => val < lowerBound || val > upperBound),
    cleaned: data.filter((val) => val >= lowerBound && val <= upperBound),
    bounds: { lower: lowerBound, upper: upperBound },
  };
};
