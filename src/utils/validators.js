/**
 * ============================================
 * VALIDADORES
 * ============================================
 *
 * Funciones de validación para formularios y datos
 */

import { REGEX, LIMITS } from './constants';

// ========================================
// VALIDACIONES BÁSICAS
// ========================================

/**
 * Validar si un valor está vacío
 *
 * @param {any} value - Valor a validar
 * @returns {boolean} True si está vacío
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validar campo requerido
 *
 * @param {any} value - Valor a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const required = (value) => {
  return isEmpty(value) ? 'Este campo es requerido' : null;
};

/**
 * Validar longitud mínima
 *
 * @param {string} value - Valor a validar
 * @param {number} min - Longitud mínima
 * @returns {string|null} Mensaje de error o null
 */
export const minLength = (value, min) => {
  if (isEmpty(value)) return null;
  return value.length < min ? `Mínimo ${min} caracteres` : null;
};

/**
 * Validar longitud máxima
 *
 * @param {string} value - Valor a validar
 * @param {number} max - Longitud máxima
 * @returns {string|null} Mensaje de error o null
 */
export const maxLength = (value, max) => {
  if (isEmpty(value)) return null;
  return value.length > max ? `Máximo ${max} caracteres` : null;
};

// ========================================
// VALIDACIONES DE FORMATO
// ========================================

/**
 * Validar email
 *
 * @param {string} email - Email a validar
 * @returns {string|null} Mensaje de error o null
 *
 * @example
 * validateEmail('test@example.com') // null (válido)
 * validateEmail('invalid-email') // "Email inválido"
 */
export const validateEmail = (email) => {
  if (isEmpty(email)) return null;
  return REGEX.EMAIL.test(email) ? null : 'Email inválido';
};

/**
 * Validar teléfono
 *
 * @param {string} phone - Teléfono a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validatePhone = (phone) => {
  if (isEmpty(phone)) return null;
  return REGEX.PHONE.test(phone) ? null : 'Teléfono inválido (10 dígitos)';
};

/**
 * Validar contraseña
 * Debe contener: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
 *
 * @param {string} password - Contraseña a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validatePassword = (password) => {
  if (isEmpty(password)) return null;

  if (password.length < LIMITS.PASSWORD_MIN) {
    return `Mínimo ${LIMITS.PASSWORD_MIN} caracteres`;
  }

  if (!REGEX.PASSWORD.test(password)) {
    return 'Debe contener mayúscula, minúscula y número';
  }

  return null;
};

/**
 * Validar confirmación de contraseña
 *
 * @param {string} password - Contraseña original
 * @param {string} confirmation - Confirmación
 * @returns {string|null} Mensaje de error o null
 */
export const validatePasswordConfirmation = (password, confirmation) => {
  if (isEmpty(confirmation)) return null;
  return password === confirmation ? null : 'Las contraseñas no coinciden';
};

/**
 * Validar URL
 *
 * @param {string} url - URL a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validateURL = (url) => {
  if (isEmpty(url)) return null;
  return REGEX.URL.test(url) ? null : 'URL inválida';
};

/**
 * Validar código DANE
 *
 * @param {string} codigo - Código DANE a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validateCodigoDane = (codigo) => {
  if (isEmpty(codigo)) return null;
  return REGEX.CODIGO_DANE.test(codigo) ? null : 'Código DANE inválido (5 dígitos)';
};

// ========================================
// VALIDACIONES NUMÉRICAS
// ========================================

/**
 * Validar número positivo
 *
 * @param {number} value - Valor a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validatePositive = (value) => {
  if (isEmpty(value)) return null;
  const num = Number(value);
  return num > 0 ? null : 'Debe ser un número positivo';
};

/**
 * Validar rango numérico
 *
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {string|null} Mensaje de error o null
 */
export const validateRange = (value, min, max) => {
  if (isEmpty(value)) return null;
  const num = Number(value);
  if (num < min) return `Mínimo ${min}`;
  if (num > max) return `Máximo ${max}`;
  return null;
};

/**
 * Validar consumo energético
 *
 * @param {number} value - Consumo en kWh
 * @returns {string|null} Mensaje de error o null
 */
export const validateConsumo = (value) => {
  if (isEmpty(value)) return 'El consumo es requerido';

  const errors = [
    validatePositive(value),
    validateRange(value, LIMITS.CONSUMO_MIN, LIMITS.CONSUMO_MAX),
  ].filter(Boolean);

  return errors.length > 0 ? errors[0] : null;
};

/**
 * Validar porcentaje (0-100)
 *
 * @param {number} value - Porcentaje a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validatePercentage = (value) => {
  if (isEmpty(value)) return null;
  return validateRange(value, 0, 100);
};

// ========================================
// VALIDACIONES DE FECHAS
// ========================================

/**
 * Validar fecha
 *
 * @param {string|Date} date - Fecha a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validateDate = (date) => {
  if (isEmpty(date)) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'Fecha inválida' : null;
};

/**
 * Validar que la fecha no sea futura
 *
 * @param {string|Date} date - Fecha a validar
 * @returns {string|null} Mensaje de error o null
 */
export const validatePastDate = (date) => {
  if (isEmpty(date)) return null;
  const d = new Date(date);
  const now = new Date();
  return d > now ? 'La fecha no puede ser futura' : null;
};

/**
 * Validar rango de fechas
 *
 * @param {string|Date} startDate - Fecha inicio
 * @param {string|Date} endDate - Fecha fin
 * @returns {string|null} Mensaje de error o null
 */
export const validateDateRange = (startDate, endDate) => {
  if (isEmpty(startDate) || isEmpty(endDate)) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return end >= start ? null : 'La fecha fin debe ser mayor a la fecha inicio';
};

// ========================================
// VALIDADOR COMPUESTO
// ========================================

/**
 * Ejecutar múltiples validaciones
 *
 * @param {any} value - Valor a validar
 * @param {Array<Function>} validators - Array de funciones validadoras
 * @returns {string|null} Primer error encontrado o null
 *
 * @example
 * const errors = validate(email, [required, validateEmail])
 */
export const validate = (value, validators) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validar objeto con múltiples campos
 *
 * @param {Object} data - Datos a validar
 * @param {Object} rules - Reglas de validación
 * @returns {Object} Objeto con errores por campo
 *
 * @example
 * const errors = validateForm(
 *   { email: 'test', password: '123' },
 *   {
 *     email: [required, validateEmail],
 *     password: [required, validatePassword]
 *   }
 * )
 */
export const validateForm = (data, rules) => {
  const errors = {};

  for (const field in rules) {
    const value = data[field];
    const fieldRules = rules[field];
    const error = validate(value, fieldRules);

    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

/**
 * Verificar si el formulario tiene errores
 *
 * @param {Object} errors - Objeto de errores
 * @returns {boolean} True si hay errores
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
