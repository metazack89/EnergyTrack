/**
 * ============================================
 * CONSTANTES DE LA APLICACIÓN
 * ============================================
 *
 * Valores constantes utilizados en toda la aplicación
 * Centraliza configuraciones, opciones y valores fijos
 */

// ========================================
// CONFIGURACIÓN GENERAL
// ========================================

/**
 * Información de la aplicación
 */
export const APP_INFO = {
  name: 'EnergyTrack',
  version: '1.0.0',
  description: 'Sistema de Gestión de Consumo Energético',
  author: 'EnergyTrack Team',
  url: 'https://energytrack.app',
};

/**
 * Configuración de API
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000,
};

// ========================================
// ROLES Y PERMISOS
// ========================================

/**
 * Roles de usuario disponibles
 */
export const ROLES = {
  ADMIN: 'admin',
  ANALISTA: 'analista',
  VISOR: 'visor',
};

/**
 * Permisos por módulo
 */
export const PERMISSIONS = {
  CONSUMOS: {
    VIEW: 'consumos.view',
    CREATE: 'consumos.create',
    EDIT: 'consumos.edit',
    DELETE: 'consumos.delete',
    EXPORT: 'consumos.export',
  },
  MUNICIPIOS: {
    VIEW: 'municipios.view',
    CREATE: 'municipios.create',
    EDIT: 'municipios.edit',
    DELETE: 'municipios.delete',
  },
  USUARIOS: {
    VIEW: 'usuarios.view',
    CREATE: 'usuarios.create',
    EDIT: 'usuarios.edit',
    DELETE: 'usuarios.delete',
  },
  PREDICCIONES: {
    VIEW: 'predicciones.view',
    CREATE: 'predicciones.create',
    DELETE: 'predicciones.delete',
    EXPORT: 'predicciones.export',
  },
  REPORTES: {
    VIEW: 'reportes.view',
    GENERATE: 'reportes.generate',
    EXPORT: 'reportes.export',
  },
};

/**
 * Mapa de permisos por rol
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS).flatMap((module) => Object.values(module)),
  [ROLES.ANALISTA]: [
    ...Object.values(PERMISSIONS.CONSUMOS),
    ...Object.values(PERMISSIONS.PREDICCIONES),
    PERMISSIONS.MUNICIPIOS.VIEW,
    PERMISSIONS.REPORTES.VIEW,
    PERMISSIONS.REPORTES.GENERATE,
  ],
  [ROLES.VISOR]: [
    PERMISSIONS.CONSUMOS.VIEW,
    PERMISSIONS.MUNICIPIOS.VIEW,
    PERMISSIONS.PREDICCIONES.VIEW,
    PERMISSIONS.REPORTES.VIEW,
  ],
};

// ========================================
// TIPOS DE FUENTES ENERGÉTICAS
// ========================================

/**
 * Tipos de fuentes de energía
 */
export const FUENTES_ENERGIA = {
  SOLAR: 'Solar',
  EOLICA: 'Eólica',
  HIDROELECTRICA: 'Hidroeléctrica',
  TERMICA: 'Térmica',
  BIOMASA: 'Biomasa',
  GEOTERMICA: 'Geotérmica',
  NUCLEAR: 'Nuclear',
};

/**
 * Configuración de fuentes energéticas
 */
export const FUENTES_CONFIG = {
  [FUENTES_ENERGIA.SOLAR]: {
    color: '#f59e0b',
    icon: 'Sun',
    renovable: true,
    factorEmisionBase: 0.05,
  },
  [FUENTES_ENERGIA.EOLICA]: {
    color: '#3b82f6',
    icon: 'Wind',
    renovable: true,
    factorEmisionBase: 0.02,
  },
  [FUENTES_ENERGIA.HIDROELECTRICA]: {
    color: '#06b6d4',
    icon: 'Droplet',
    renovable: true,
    factorEmisionBase: 0.03,
  },
  [FUENTES_ENERGIA.TERMICA]: {
    color: '#ef4444',
    icon: 'Flame',
    renovable: false,
    factorEmisionBase: 0.85,
  },
  [FUENTES_ENERGIA.BIOMASA]: {
    color: '#10b981',
    icon: 'Leaf',
    renovable: true,
    factorEmisionBase: 0.15,
  },
};

// ========================================
// ESTADOS Y PRIORIDADES
// ========================================

/**
 * Estados de registros
 */
export const ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  PENDIENTE: 'pendiente',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

/**
 * Niveles de prioridad
 */
export const PRIORIDADES = {
  ALTA: 'high',
  MEDIA: 'medium',
  BAJA: 'low',
};

// ========================================
// CONFIGURACIÓN DE GRÁFICOS
// ========================================

/**
 * Colores para gráficos
 */
export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  gray: '#6b7280',
};

/**
 * Paleta de colores para múltiples series
 */
export const CHART_PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
];

// ========================================
// CONFIGURACIÓN DE PAGINACIÓN
// ========================================

/**
 * Opciones de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// ========================================
// FORMATOS Y UNIDADES
// ========================================

/**
 * Unidades de medida
 */
export const UNIDADES = {
  ENERGIA: 'kWh',
  POTENCIA: 'kW',
  EMISION: 'kg CO₂',
  MONEDA: 'COP',
  PORCENTAJE: '%',
};

/**
 * Meses del año
 */
export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Meses abreviados
 */
export const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

/**
 * Días de la semana
 */
export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

// ========================================
// VALIDACIONES
// ========================================

/**
 * Expresiones regulares comunes
 */
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/,
  CODIGO_DANE: /^[0-9]{5}$/,
};

/**
 * Límites de campos
 */
export const LIMITS = {
  NOMBRE_MIN: 3,
  NOMBRE_MAX: 100,
  DESCRIPCION_MAX: 500,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 50,
  CONSUMO_MIN: 0,
  CONSUMO_MAX: 999999999,
};

// ========================================
// MENSAJES
// ========================================

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  CREAR: 'Registro creado exitosamente',
  ACTUALIZAR: 'Registro actualizado exitosamente',
  ELIMINAR: 'Registro eliminado exitosamente',
  EXPORTAR: 'Datos exportados exitosamente',
  IMPORTAR: 'Datos importados exitosamente',
};

/**
 * Mensajes de error
 */
export const ERROR_MESSAGES = {
  GENERICO: 'Ha ocurrido un error. Intenta nuevamente',
  RED: 'Error de conexión. Verifica tu internet',
  AUTENTICACION: 'Credenciales inválidas',
  PERMISOS: 'No tienes permisos para esta acción',
  NO_ENCONTRADO: 'Registro no encontrado',
  VALIDACION: 'Por favor corrige los errores del formulario',
};

// ========================================
// CONFIGURACIÓN DE EXPORTACIÓN
// ========================================

/**
 * Formatos de exportación disponibles
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
};

/**
 * Configuración de exportación
 */
export const EXPORT_CONFIG = {
  MAX_ROWS: 10000,
  FILENAME_PREFIX: 'energytrack_',
  DATE_FORMAT: 'YYYY-MM-DD',
};

// ========================================
// CONFIGURACIÓN DE CACHÉ
// ========================================

/**
 * Tiempos de caché (en milisegundos)
 */
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 30 * 60 * 1000, // 30 minutos
  LONG: 24 * 60 * 60 * 1000, // 24 horas
};

/**
 * Keys de localStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  FILTERS: 'filters',
  PREFERENCES: 'preferences',
};
