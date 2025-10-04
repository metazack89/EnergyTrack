/**
 * Tipos centralizados de la aplicación
 * Usar JSDoc para documentación y autocompletado
 */

// Re-exportar todos los tipos
export * from './consumo.types';
export * from './user.types';
export * from './municipio.types';
export * from './prediccion.types';

/**
 * @typedef {Object} FuenteEnergia
 * @property {string} id - UUID de la fuente
 * @property {string} tipo - Tipo de fuente (electrica, solar, eolica, etc)
 * @property {string|null} descripcion - Descripción
 * @property {string} created_at - Timestamp de creación
 */

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {T} data - Datos de respuesta
 * @property {string} [error] - Mensaje de error (si hay)
 * @property {number} status - Código de estado HTTP
 */

/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {T[]} data - Array de datos
 * @property {number} total - Total de registros
 * @property {number} page - Página actual
 * @property {number} pageSize - Tamaño de página
 * @property {number} totalPages - Total de páginas
 */

/**
 * @typedef {Object} ChartData
 * @property {string} label - Etiqueta del punto
 * @property {number} value - Valor numérico
 * @property {string} [color] - Color (opcional)
 */

export default {};
