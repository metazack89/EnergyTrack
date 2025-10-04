/**
 * ============================================
 * FORMATEADORES
 * ============================================
 *
 * Funciones para formatear datos (números, fechas, texto)
 */

import { UNIDADES, MESES, MESES_CORTOS } from './constants';

// ========================================
// FORMATEO DE NÚMEROS
// ========================================

/**
 * Formatear número con separadores de miles
 *
 * @param {number} value - Número a formatear
 * @param {number} [decimals=0] - Cantidad de decimales
 * @returns {string} Número formateado
 *
 * @example
 * formatNumber(1234567.89, 2) // "1,234,567.89"
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatear moneda (COP)
 *
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado con símbolo de moneda
 *
 * @example
 * formatCurrency(1234567) // "$1,234,567"
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatear porcentaje
 *
 * @param {number} value - Valor decimal (0-1 o 0-100)
 * @param {number} [decimals=1] - Decimales a mostrar
 * @param {boolean} [isDecimal=false] - Si el valor está en formato decimal
 * @returns {string} Porcentaje formateado
 *
 * @example
 * formatPercentage(0.75, 1, true) // "75.0%"
 * formatPercentage(75, 1) // "75.0%"
 */
export const formatPercentage = (value, decimals = 1, isDecimal = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percent = isDecimal ? value * 100 : value;
  return `${formatNumber(percent, decimals)}%`;
};

/**
 * Formatear número con unidad de energía
 *
 * @param {number} value - Valor en kWh
 * @param {number} [decimals=0] - Decimales
 * @returns {string} Valor formateado con unidad
 *
 * @example
 * formatEnergy(12345.67, 2) // "12,345.67 kWh"
 */
export const formatEnergy = (value, decimals = 0) => {
  return `${formatNumber(value, decimals)} ${UNIDADES.ENERGIA}`;
};

/**
 * Formatear emisiones de CO2
 *
 * @param {number} value - Valor en kg
 * @param {number} [decimals=2] - Decimales
 * @returns {string} Valor formateado
 *
 * @example
 * formatEmissions(1234.5678) // "1,234.57 kg CO₂"
 */
export const formatEmissions = (value, decimals = 2) => {
  return `${formatNumber(value, decimals)} ${UNIDADES.EMISION}`;
};

/**
 * Convertir número a formato compacto (K, M, B)
 *
 * @param {number} value - Número a formatear
 * @returns {string} Número compacto
 *
 * @example
 * formatCompactNumber(1500) // "1.5K"
 * formatCompactNumber(1500000) // "1.5M"
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
};

// ========================================
// FORMATEO DE FECHAS
// ========================================

/**
 * Formatear fecha a string legible
 *
 * @param {Date|string} date - Fecha a formatear
 * @param {string} [format='long'] - Formato: 'short' | 'long' | 'medium'
 * @returns {string} Fecha formateada
 *
 * @example
 * formatDate('2024-01-15') // "15 de enero de 2024"
 * formatDate('2024-01-15', 'short') // "15/01/2024"
 */
export const formatDate = (date, format = 'long') => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
  };

  return new Intl.DateTimeFormat('es-CO', options[format]).format(d);
};

/**
 * Formatear fecha y hora
 *
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 *
 * @example
 * formatDateTime('2024-01-15T14:30:00') // "15/01/2024 14:30"
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Formatear fecha relativa (hace X tiempo)
 *
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 *
 * @example
 * formatRelativeTime('2024-01-14') // "hace 1 día"
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;

  return formatDate(date, 'short');
};

// ========================================
// FORMATEO DE TEXTO
// ========================================

/**
 * Capitalizar primera letra
 *
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Truncar texto con elipsis
 *
 * @param {string} text - Texto a truncar
 * @param {number} [maxLength=50] - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatear nombre de archivo
 *
 * @param {string} filename - Nombre del archivo
 * @param {string} [prefix=''] - Prefijo opcional
 * @returns {string} Nombre formateado
 */
export const formatFilename = (filename, prefix = '') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitized = filename.toLowerCase().replace(/\s+/g, '_');
  return `${prefix}${sanitized}_${timestamp}`;
};
