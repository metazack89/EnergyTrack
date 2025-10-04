/**
 * ============================================
 * HELPERS DE STORAGE
 * ============================================
 *
 * Utilidades para localStorage y sessionStorage
 */

import { STORAGE_KEYS, CACHE_DURATION } from './constants';

// ========================================
// OPERACIONES BÁSICAS
// ========================================

/**
 * Guardar en localStorage
 *
 * @param {string} key - Clave
 * @param {any} value - Valor (será JSON.stringify)
 * @returns {boolean} True si se guardó exitosamente
 *
 * @example
 * setItem('user', { id: 1, name: 'Juan' })
 */
export const setItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
    return false;
  }
};

/**
 * Obtener de localStorage
 *
 * @param {string} key - Clave
 * @param {any} [defaultValue=null] - Valor por defecto
 * @returns {any} Valor deserializado
 *
 * @example
 * const user = getItem('user')
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return defaultValue;
  }
};

/**
 * Eliminar de localStorage
 *
 * @param {string} key - Clave
 * @returns {boolean} True si se eliminó
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
    return false;
  }
};

/**
 * Limpiar todo localStorage
 *
 * @returns {boolean} True si se limpió
 */
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
    return false;
  }
};

// ========================================
// STORAGE CON EXPIRACIÓN
// ========================================

/**
 * Guardar con tiempo de expiración
 *
 * @param {string} key - Clave
 * @param {any} value - Valor
 * @param {number} [ttl=CACHE_DURATION.MEDIUM] - Tiempo de vida en ms
 * @returns {boolean} True si se guardó
 *
 * @example
 * setItemWithExpiry('cache_data', data, 5 * 60 * 1000) // 5 minutos
 */
export const setItemWithExpiry = (key, value, ttl = CACHE_DURATION.MEDIUM) => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  return setItem(key, item);
};

/**
 * Obtener con validación de expiración
 *
 * @param {string} key - Clave
 * @param {any} [defaultValue=null] - Valor por defecto
 * @returns {any} Valor si no ha expirado, null si expiró
 *
 * @example
 * const data = getItemWithExpiry('cache_data')
 */
export const getItemWithExpiry = (key, defaultValue = null) => {
  const item = getItem(key);

  if (!item) return defaultValue;

  const now = new Date();

  // Si expiró, eliminar y retornar null
  if (now.getTime() > item.expiry) {
    removeItem(key);
    return defaultValue;
  }

  return item.value;
};

// ========================================
// HELPERS ESPECÍFICOS DE LA APP
// ========================================

/**
 * Guardar token de autenticación
 *
 * @param {string} token - Token JWT
 * @returns {boolean} True si se guardó
 */
export const saveAuthToken = (token) => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Obtener token de autenticación
 *
 * @returns {string|null} Token o null
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Eliminar token de autenticación
 *
 * @returns {boolean} True si se eliminó
 */
export const removeAuthToken = () => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Guardar datos de usuario
 *
 * @param {Object} userData - Datos del usuario
 * @returns {boolean} True si se guardó
 */
export const saveUserData = (userData) => {
  return setItem(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Obtener datos de usuario
 *
 * @returns {Object|null} Datos del usuario
 */
export const getUserData = () => {
  return getItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Guardar preferencias del usuario
 *
 * @param {Object} preferences - Preferencias
 * @returns {boolean} True si se guardó
 */
export const savePreferences = (preferences) => {
  return setItem(STORAGE_KEYS.PREFERENCES, preferences);
};

/**
 * Obtener preferencias del usuario
 *
 * @returns {Object} Preferencias
 */
export const getPreferences = () => {
  return getItem(STORAGE_KEYS.PREFERENCES, {
    theme: 'light',
    language: 'es',
    notifications: true,
  });
};

/**
 * Guardar filtros aplicados
 *
 * @param {string} page - Nombre de la página
 * @param {Object} filters - Filtros
 * @returns {boolean} True si se guardó
 */
export const saveFilters = (page, filters) => {
  const allFilters = getItem(STORAGE_KEYS.FILTERS, {});
  allFilters[page] = filters;
  return setItem(STORAGE_KEYS.FILTERS, allFilters);
};

/**
 * Obtener filtros de una página
 *
 * @param {string} page - Nombre de la página
 * @returns {Object} Filtros guardados
 */
export const getFilters = (page) => {
  const allFilters = getItem(STORAGE_KEYS.FILTERS, {});
  return allFilters[page] || {};
};

/**
 * Limpiar datos de sesión al cerrar sesión
 *
 * @returns {boolean} True si se limpió
 */
export const clearSessionData = () => {
  const keysToRemove = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA];

  keysToRemove.forEach((key) => removeItem(key));
  return true;
};

// ========================================
// SESSIONSTORAGE (datos temporales)
// ========================================

/**
 * Guardar en sessionStorage
 *
 * @param {string} key - Clave
 * @param {any} value - Valor
 * @returns {boolean} True si se guardó
 */
export const setSessionItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Error al guardar en sessionStorage:', error);
    return false;
  }
};

/**
 * Obtener de sessionStorage
 *
 * @param {string} key - Clave
 * @param {any} [defaultValue=null] - Valor por defecto
 * @returns {any} Valor deserializado
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error al leer de sessionStorage:', error);
    return defaultValue;
  }
};

/**
 * Verificar disponibilidad de localStorage
 *
 * @returns {boolean} True si está disponible
 */
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
