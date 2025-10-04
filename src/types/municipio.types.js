/**
 * @typedef {Object} Departamento
 * @property {string} id - UUID del departamento
 * @property {string} nombre - Nombre del departamento
 * @property {string} codigo - Código DANE
 * @property {string} created_at - Timestamp de creación
 */

/**
 * @typedef {Object} Municipio
 * @property {string} id - UUID del municipio
 * @property {string} nombre - Nombre del municipio
 * @property {string} codigo_dane - Código DANE
 * @property {string} departamento_id - ID del departamento
 * @property {number|null} poblacion - Población (opcional)
 * @property {number|null} area_km2 - Área en km² (opcional)
 * @property {string} created_at - Timestamp de creación
 * @property {string} updated_at - Timestamp de actualización
 * @property {Departamento|null} departamentos - Datos del departamento (relación)
 */

/**
 * @typedef {Object} MunicipioCreateDTO
 * @property {string} nombre - Nombre del municipio
 * @property {string} codigo_dane - Código DANE
 * @property {string} departamento_id - ID del departamento
 * @property {number} [poblacion] - Población
 * @property {number} [area_km2] - Área en km²
 */

/**
 * @typedef {Object} MunicipioUpdateDTO
 * @property {string} [nombre] - Nombre del municipio
 * @property {string} [codigo_dane] - Código DANE
 * @property {string} [departamento_id] - ID del departamento
 * @property {number} [poblacion] - Población
 * @property {number} [area_km2] - Área en km²
 */

/**
 * @typedef {Object} MunicipioStats
 * @property {number} total_consumo - Consumo total del municipio
 * @property {number} promedio_mensual - Promedio mensual
 * @property {number} per_capita - Consumo per cápita (si tiene población)
 */

export default {};
