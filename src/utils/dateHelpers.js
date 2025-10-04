/**
 * ============================================
 * HELPERS DE FECHAS
 * ============================================
 *
 * Utilidades para manipulación de fechas
 */

import { MESES, MESES_CORTOS, DIAS_SEMANA } from './constants';

// ========================================
// OPERACIONES CON FECHAS
// ========================================

/**
 * Obtener fecha actual sin horas
 *
 * @returns {Date} Fecha a las 00:00:00
 */
export const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Añadir días a una fecha
 *
 * @param {Date|string} date - Fecha base
 * @param {number} days - Días a añadir (puede ser negativo)
 * @returns {Date} Nueva fecha
 *
 * @example
 * addDays(new Date(), 7) // Fecha en 7 días
 * addDays(new Date(), -7) // Fecha hace 7 días
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Añadir meses a una fecha
 *
 * @param {Date|string} date - Fecha base
 * @param {number} months - Meses a añadir
 * @returns {Date} Nueva fecha
 */
export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Añadir años a una fecha
 *
 * @param {Date|string} date - Fecha base
 * @param {number} years - Años a añadir
 * @returns {Date} Nueva fecha
 */
export const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Obtener primer día del mes
 *
 * @param {Date|string} [date] - Fecha (default: hoy)
 * @returns {Date} Primer día del mes
 */
export const startOfMonth = (date = new Date()) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtener último día del mes
 *
 * @param {Date|string} [date] - Fecha (default: hoy)
 * @returns {Date} Último día del mes
 */
export const endOfMonth = (date = new Date()) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Obtener primer día del año
 *
 * @param {Date|string} [date] - Fecha (default: hoy)
 * @returns {Date} Primer día del año
 */
export const startOfYear = (date = new Date()) => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtener último día del año
 *
 * @param {Date|string} [date] - Fecha (default: hoy)
 * @returns {Date} Último día del año
 */
export const endOfYear = (date = new Date()) => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

// ========================================
// COMPARACIONES
// ========================================

/**
 * Verificar si dos fechas son el mismo día
 *
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {boolean} True si son el mismo día
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Verificar si una fecha está en el pasado
 *
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si está en el pasado
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Verificar si una fecha está en el futuro
 *
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si está en el futuro
 */
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Calcular diferencia en días entre dos fechas
 *
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const diffInDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ========================================
// FORMATEO Y CONVERSIÓN
// ========================================

/**
 * Convertir fecha a formato ISO (YYYY-MM-DD)
 *
 * @param {Date|string} date - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISODate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Obtener nombre del mes
 *
 * @param {number} month - Número del mes (0-11)
 * @param {boolean} [short=false] - Usar nombre corto
 * @returns {string} Nombre del mes
 */
export const getMonthName = (month, short = false) => {
  return short ? MESES_CORTOS[month] : MESES[month];
};

/**
 * Obtener nombre del día de la semana
 *
 * @param {number} day - Número del día (0-6)
 * @returns {string} Nombre del día
 */
export const getDayName = (day) => {
  return DIAS_SEMANA[day];
};

// ========================================
// RANGOS Y PERÍODOS
// ========================================

/**
 * Generar array de fechas entre dos fechas
 *
 * @param {Date|string} startDate - Fecha inicio
 * @param {Date|string} endDate - Fecha fin
 * @returns {Array<Date>} Array de fechas
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * Obtener último mes completo
 *
 * @returns {Object} {start, end}
 */
export const getLastMonth = () => {
  const now = new Date();
  const lastMonth = addMonths(now, -1);

  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
};

/**
 * Obtener últimos N días
 *
 * @param {number} days - Número de días
 * @returns {Object} {start, end}
 */
export const getLastNDays = (days) => {
  const end = today();
  const start = addDays(end, -days + 1);

  return { start, end };
};

/**
 * Obtener año actual completo
 *
 * @returns {Object} {start, end}
 */
export const getCurrentYear = () => {
  return {
    start: startOfYear(),
    end: endOfYear(),
  };
};

/**
 * Generar array de meses del año
 *
 * @param {number} year - Año
 * @returns {Array<Object>} Array de {mes, nombre, start, end}
 */
export const getMonthsOfYear = (year) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      mes: i + 1,
      nombre: MESES[i],
      nombreCorto: MESES_CORTOS[i],
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });
};
