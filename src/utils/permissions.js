/**
 * ============================================
 * HELPERS DE PERMISOS
 * ============================================
 *
 * Funciones para gestión de permisos y roles
 */

import { ROLES, ROLE_PERMISSIONS } from './constants';

// ========================================
// VERIFICACIÓN DE PERMISOS
// ========================================

/**
 * Verificar si un usuario tiene un permiso específico
 *
 * @param {Object} user - Usuario con rol
 * @param {string} permission - Permiso a verificar
 * @returns {boolean} True si tiene el permiso
 *
 * @example
 * hasPermission(user, 'consumos.create') // true/false
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  // Admin tiene todos los permisos
  if (user.role === ROLES.ADMIN) return true;

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Verificar si tiene alguno de los permisos
 *
 * @param {Object} user - Usuario
 * @param {Array<string>} permissions - Array de permisos
 * @returns {boolean} True si tiene al menos uno
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Verificar si tiene todos los permisos
 *
 * @param {Object} user - Usuario
 * @param {Array<string>} permissions - Array de permisos
 * @returns {boolean} True si tiene todos
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every((permission) => hasPermission(user, permission));
};

// ========================================
// VERIFICACIÓN DE ROLES
// ========================================

/**
 * Verificar si el usuario tiene un rol específico
 *
 * @param {Object} user - Usuario
 * @param {string} role - Rol a verificar
 * @returns {boolean} True si tiene el rol
 */
export const hasRole = (user, role) => {
  return user?.role === role;
};

/**
 * Verificar si es administrador
 *
 * @param {Object} user - Usuario
 * @returns {boolean} True si es admin
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Verificar si es analista
 *
 * @param {Object} user - Usuario
 * @returns {boolean} True si es analista
 */
export const isAnalista = (user) => {
  return hasRole(user, ROLES.ANALISTA);
};

/**
 * Verificar si es visor
 *
 * @param {Object} user - Usuario
 * @returns {boolean} True si es visor
 */
export const isVisor = (user) => {
  return hasRole(user, ROLES.VISOR);
};

// ========================================
// HELPERS DE PERMISOS POR MÓDULO
// ========================================

/**
 * Verificar permisos de lectura
 *
 * @param {Object} user - Usuario
 * @param {string} module - Módulo
 * @returns {boolean} True si puede ver
 */
export const canView = (user, module) => {
  return hasPermission(user, `${module}.view`);
};

/**
 * Verificar permisos de creación
 *
 * @param {Object} user - Usuario
 * @param {string} module - Módulo
 * @returns {boolean} True si puede crear
 */
export const canCreate = (user, module) => {
  return hasPermission(user, `${module}.create`);
};

/**
 * Verificar permisos de edición
 *
 * @param {Object} user - Usuario
 * @param {string} module - Módulo
 * @returns {boolean} True si puede editar
 */
export const canEdit = (user, module) => {
  return hasPermission(user, `${module}.edit`);
};

/**
 * Verificar permisos de eliminación
 *
 * @param {Object} user - Usuario
 * @param {string} module - Módulo
 * @returns {boolean} True si puede eliminar
 */
export const canDelete = (user, module) => {
  return hasPermission(user, `${module}.delete`);
};

/**
 * Obtener todos los permisos del usuario
 *
 * @param {Object} user - Usuario
 * @returns {Array<string>} Array de permisos
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  return ROLE_PERMISSIONS[user.role] || [];
};
