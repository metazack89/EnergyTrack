/**
 * @typedef {Object} Consumo
 * @property {string} id - UUID del consumo
 * @property {number} anio - Año del registro
 * @property {number} mes - Mes del registro (1-12)
 * @property {number} valor_kwh - Valor en kWh
 * @property {string} municipio_id - ID del municipio
 * @property {string} fuente_id - ID de la fuente de energía
 * @property {string|null} created_by - ID del usuario que creó
 * @property {string} created_at - Timestamp de creación
 * @property {string} updated_at - Timestamp de actualización
 * @property {Municipio|null} municipios - Datos del municipio (relación)
 * @property {FuenteEnergia|null} fuentes_energia - Datos de la fuente (relación)
 */

/**
 * @typedef {Object} ConsumoCreateDTO
 * @property {number} anio - Año del registro
 * @property {number} mes - Mes del registro (1-12)
 * @property {number} valor_kwh - Valor en kWh
 * @property {string} municipio_id - ID del municipio
 * @property {string} fuente_id - ID de la fuente de energía
 */

/**
 * @typedef {Object} ConsumoUpdateDTO
 * @property {number} [anio] - Año del registro
 * @property {number} [mes] - Mes del registro
 * @property {number} [valor_kwh] - Valor en kWh
 * @property {string} [municipio_id] - ID del municipio
 * @property {string} [fuente_id] - ID de la fuente
 */

/**
 * @typedef {Object} ConsumoFilters
 * @property {number} [anio] - Filtrar por año
 * @property {number} [mes] - Filtrar por mes
 * @property {string} [municipio_id] - Filtrar por municipio
 * @property {string} [fuente_id] - Filtrar por fuente
 * @property {number} [min_kwh] - Valor mínimo en kWh
 * @property {number} [max_kwh] - Valor máximo en kWh
 */

/**
 * @typedef {Object} ConsumoStats
 * @property {number} total - Total de consumo
 * @property {number} promedio - Promedio de consumo
 * @property {number} maximo - Consumo máximo
 * @property {number} minimo - Consumo mínimo
 * @property {number} registros - Cantidad de registros
 */

export default {};
