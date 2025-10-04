/**
 * ============================================
 * CÁLCULOS ENERGÉTICOS
 * ============================================
 *
 * Funciones para cálculos relacionados con energía
 */

// ========================================
// CÁLCULOS BÁSICOS
// ========================================

/**
 * Calcular consumo promedio
 *
 * @param {Array<number>} consumos - Array de consumos
 * @returns {number} Promedio
 *
 * @example
 * calcularPromedio([100, 200, 300]) // 200
 */
export const calcularPromedio = (consumos) => {
  if (!consumos || consumos.length === 0) return 0;
  const sum = consumos.reduce((acc, val) => acc + val, 0);
  return sum / consumos.length;
};

/**
 * Calcular desviación estándar
 *
 * @param {Array<number>} valores - Array de valores
 * @returns {number} Desviación estándar
 */
export const calcularDesviacionEstandar = (valores) => {
  if (!valores || valores.length === 0) return 0;

  const promedio = calcularPromedio(valores);
  const varianza =
    valores.reduce((acc, val) => {
      return acc + Math.pow(val - promedio, 2);
    }, 0) / valores.length;

  return Math.sqrt(varianza);
};

/**
 * Calcular tendencia (crecimiento/decrecimiento)
 *
 * @param {number} actual - Valor actual
 * @param {number} anterior - Valor anterior
 * @returns {Object} {porcentaje, direccion}
 *
 * @example
 * calcularTendencia(120, 100) // {porcentaje: 20, direccion: 'up'}
 */
export const calcularTendencia = (actual, anterior) => {
  if (!anterior || anterior === 0) {
    return { porcentaje: 0, direccion: 'neutral' };
  }

  const diferencia = actual - anterior;
  const porcentaje = (diferencia / anterior) * 100;

  return {
    porcentaje: Math.abs(porcentaje),
    direccion: porcentaje > 0 ? 'up' : porcentaje < 0 ? 'down' : 'neutral',
    valor: diferencia,
  };
};

/**
 * Calcular variación porcentual
 *
 * @param {number} valorNuevo - Valor nuevo
 * @param {number} valorViejo - Valor anterior
 * @returns {number} Porcentaje de variación
 */
export const calcularVariacion = (valorNuevo, valorViejo) => {
  if (!valorViejo || valorViejo === 0) return 0;
  return ((valorNuevo - valorViejo) / valorViejo) * 100;
};

// ========================================
// CÁLCULOS DE CONSUMO
// ========================================

/**
 * Calcular consumo total de un período
 *
 * @param {Array<Object>} consumos - Array de objetos con consumo
 * @param {string} [key='valor_kwh'] - Key del consumo
 * @returns {number} Total
 */
export const calcularConsumoTotal = (consumos, key = 'valor_kwh') => {
  if (!consumos || consumos.length === 0) return 0;
  return consumos.reduce((acc, item) => acc + (item[key] || 0), 0);
};

/**
 * Calcular consumo por fuente de energía
 *
 * @param {Array<Object>} consumos - Consumos con fuentes
 * @returns {Object} Consumo agrupado por fuente
 */
export const calcularConsumoPorFuente = (consumos) => {
  if (!consumos || consumos.length === 0) return {};

  return consumos.reduce((acc, consumo) => {
    const fuente = consumo.fuentes_energia?.tipo || 'Sin clasificar';
    acc[fuente] = (acc[fuente] || 0) + consumo.valor_kwh;
    return acc;
  }, {});
};

/**
 * Calcular consumo por municipio
 *
 * @param {Array<Object>} consumos - Consumos
 * @returns {Object} Consumo por municipio
 */
export const calcularConsumoPorMunicipio = (consumos) => {
  if (!consumos || consumos.length === 0) return {};

  return consumos.reduce((acc, consumo) => {
    const municipio = consumo.municipios?.nombre || 'Sin municipio';
    acc[municipio] = (acc[municipio] || 0) + consumo.valor_kwh;
    return acc;
  }, {});
};

/**
 * Calcular pico de consumo
 *
 * @param {Array<Object>} consumos - Consumos
 * @returns {Object} Consumo máximo con metadata
 */
export const calcularPicoConsumo = (consumos) => {
  if (!consumos || consumos.length === 0) return null;

  return consumos.reduce((max, consumo) => {
    return consumo.valor_kwh > (max?.valor_kwh || 0) ? consumo : max;
  }, consumos[0]);
};

/**
 * Calcular valle de consumo (mínimo)
 *
 * @param {Array<Object>} consumos - Consumos
 * @returns {Object} Consumo mínimo con metadata
 */
export const calcularValleConsumo = (consumos) => {
  if (!consumos || consumos.length === 0) return null;

  return consumos.reduce((min, consumo) => {
    return consumo.valor_kwh < (min?.valor_kwh || Infinity) ? consumo : min;
  }, consumos[0]);
};

// ========================================
// CÁLCULOS ECONÓMICOS
// ========================================

/**
 * Calcular costo energético
 *
 * @param {number} consumoKwh - Consumo en kWh
 * @param {number} [tarifaKwh=800] - Tarifa por kWh en COP
 * @returns {number} Costo total
 */
export const calcularCosto = (consumoKwh, tarifaKwh = 800) => {
  return consumoKwh * tarifaKwh;
};

/**
 * Calcular ahorro potencial
 *
 * @param {number} consumoActual - Consumo actual en kWh
 * @param {number} porcentajeReduccion - Porcentaje de reducción esperado
 * @param {number} [tarifaKwh=800] - Tarifa por kWh
 * @returns {Object} {ahorroKwh, ahorroCOP}
 */
export const calcularAhorroPotencial = (consumoActual, porcentajeReduccion, tarifaKwh = 800) => {
  const ahorroKwh = consumoActual * (porcentajeReduccion / 100);
  const ahorroCOP = calcularCosto(ahorroKwh, tarifaKwh);

  return {
    ahorroKwh,
    ahorroCOP,
    porcentaje: porcentajeReduccion,
  };
};

/**
 * Calcular retorno de inversión (ROI)
 *
 * @param {number} inversion - Inversión inicial
 * @param {number} ahorroMensual - Ahorro mensual
 * @returns {Object} {meses, años, roi}
 */
export const calcularROI = (inversion, ahorroMensual) => {
  if (!ahorroMensual || ahorroMensual === 0) {
    return { meses: Infinity, años: Infinity, roi: 0 };
  }

  const meses = inversion / ahorroMensual;
  const años = meses / 12;
  const roi = ((ahorroMensual * 12) / inversion) * 100;

  return {
    meses: Math.ceil(meses),
    años: años.toFixed(1),
    roi: roi.toFixed(2),
  };
};

// ========================================
// CÁLCULOS AMBIENTALES
// ========================================

/**
 * Calcular emisiones de CO2
 *
 * @param {number} consumoKwh - Consumo en kWh
 * @param {number} [factorEmision=0.5] - Factor de emisión (kg CO2/kWh)
 * @returns {number} Emisiones en kg CO2
 */
export const calcularEmisionesCO2 = (consumoKwh, factorEmision = 0.5) => {
  return consumoKwh * factorEmision;
};

/**
 * Calcular equivalente en árboles
 * Un árbol absorbe aproximadamente 21 kg CO2/año
 *
 * @param {number} emisionesKg - Emisiones en kg CO2
 * @returns {number} Número de árboles equivalentes
 */
export const calcularEquivalenteArboles = (emisionesKg) => {
  const CO2_POR_ARBOL_ANUAL = 21;
  return Math.ceil(emisionesKg / CO2_POR_ARBOL_ANUAL);
};

// ========================================
// CÁLCULOS ESTADÍSTICOS
// ========================================

/**
 * Calcular percentil
 *
 * @param {Array<number>} valores - Array de valores
 * @param {number} percentil - Percentil a calcular (0-100)
 * @returns {number} Valor del percentil
 */
export const calcularPercentil = (valores, percentil) => {
  if (!valores || valores.length === 0) return 0;

  const sorted = [...valores].sort((a, b) => a - b);
  const index = (percentil / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Calcular regresión lineal simple
 *
 * @param {Array<number>} x - Valores X
 * @param {Array<number>} y - Valores Y
 * @returns {Object} {pendiente, interseccion, r2}
 */
export const calcularRegresionLineal = (x, y) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const interseccion = (sumY - pendiente * sumX) / n;

  return {
    pendiente,
    interseccion,
    predict: (xVal) => pendiente * xVal + interseccion,
  };
};
