/**
 * @typedef {'admin' | 'gestor' | 'analista' | 'viewer'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID del usuario
 * @property {string} email - Email del usuario
 * @property {string} created_at - Timestamp de creación
 * @property {string} last_sign_in_at - Último inicio de sesión
 * @property {Object} user_metadata - Metadata del usuario
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID del perfil (igual al user.id)
 * @property {string} email - Email del usuario
 * @property {string} full_name - Nombre completo
 * @property {UserRole} role - Rol del usuario
 * @property {string|null} telefono - Teléfono (opcional)
 * @property {string|null} departamento - Departamento (opcional)
 * @property {string|null} cargo - Cargo (opcional)
 * @property {string|null} organizacion - Organización (opcional)
 * @property {string} created_at - Timestamp de creación
 * @property {string} updated_at - Timestamp de actualización
 * @property {number} [consumos_count] - Contador de consumos creados
 * @property {number} [reportes_count] - Contador de reportes generados
 * @property {number} [predicciones_count] - Contador de predicciones
 * @property {number} [dias_activo] - Días desde el registro
 */

/**
 * @typedef {Object} ProfileUpdateDTO
 * @property {string} [full_name] - Nombre completo
 * @property {string} [email] - Email
 * @property {string} [telefono] - Teléfono
 * @property {string} [departamento] - Departamento
 * @property {string} [cargo] - Cargo
 * @property {string} [organizacion] - Organización
 */

/**
 * @typedef {Object} AuthCredentials
 * @property {string} email - Email del usuario
 * @property {string} password - Contraseña
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - Email del usuario
 * @property {string} password - Contraseña
 * @property {string} full_name - Nombre completo
 * @property {UserRole} [role] - Rol (default: 'viewer')
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user - Datos del usuario
 * @property {string} access_token - Token de acceso
 * @property {string} refresh_token - Token de refresco
 */

export default {};
