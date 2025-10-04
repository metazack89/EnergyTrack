/**
 * @typedef {Object} Prediccion
 * @property {string} id - UUID de la predicción
 * @property {string} municipio_id - ID del municipio
 * @property {number} meses_predichos - Cantidad de meses predichos
 * @property {number[]} valores_predichos - Array de valores predichos en kWh
 * @property {number|null} precision - Precisión MAE de la predicción
 * @property {Object|null} metadata - Metadata adicional (JSON)
 * @property {string} user_id - ID del usuario que generó
 * @property {string} created_at - Timestamp de creación
 * @property {Municipio|null} municipios - Datos del municipio (relación)
 */

/**
 * @typedef {Object} PrediccionValue
 * @property {number} valor - Valor predicho en kWh
 * @property {number} min - Valor mínimo del intervalo de confianza
 * @property {number} max - Valor máximo del intervalo de confianza
 */

/**
 * @typedef {Object} PrediccionCreateDTO
 * @property {string} municipio_id - ID del municipio
 * @property {number} meses_predichos - Cantidad de meses a predecir
 * @property {number[]} valores_predichos - Array de valores
 * @property {number} [precision] - Precisión MAE
 * @property {Object} [metadata] - Metadata adicional
 */

/**
 * @typedef {Object} PrediccionMetrics
 * @property {number} mae - Mean Absolute Error
 * @property {number} mape - Mean Absolute Percentage Error
 * @property {number} rmse - Root Mean Square Error
 */

/**
 * @typedef {Object} SimulacionParams
 * @property {number} reduccionObjetivo - Porcentaje de reducción (-50 a 50)
 * @property {number} eficienciaEnergetica - Porcentaje de eficiencia (0-50)
 * @property {number} crecimientoPoblacional - Porcentaje anual (0-10)
 * @property {number} nuevaInfraestructura - kWh adicionales
 * @property {number} mesesSimulacion - Meses a simular (6, 12, 24, 36)
 * @property {number} [precioKwh] - Precio por kWh (COP)
 * @property {number} [factorEmision] - Factor de emisión CO2 (kg/kWh)
 * @property {number} [inversionEficiencia] - Inversión en COP
 */

/**
 * @typedef {Object} Escenario
 * @property {string} nombre - Nombre del escenario
 * @property {string} descripcion - Descripción
 * @property {PrediccionValue[]} datos - Datos del escenario
 * @property {string} color - Color para gráficos
 * @property {string} tipo - Tipo de escenario
 * @property {number} [prioridad] - Prioridad (0-5)
 */

export default {};
