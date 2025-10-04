/**
 * Servicio de predicciones usando algoritmos de Machine Learning simples
 * Implementa regresión lineal y análisis de series temporales
 */

export const predictorService = {
  /**
   * Predecir consumo futuro usando regresión lineal
   * @param {Array<number>} historico - Array de valores históricos
   * @param {number} periodos - Número de periodos a predecir
   * @returns {Array<Object>} Predicciones con intervalos de confianza
   */
  predecirConsumo(historico, periodos = 6) {
    if (!historico || historico.length < 3) {
      throw new Error('Se necesitan al menos 3 datos históricos');
    }

    const n = historico.length;
    const { pendiente, interseccion } = this.regresionLineal(historico);

    const predicciones = [];
    const errorEstandar = this.calcularErrorEstandar(historico, pendiente, interseccion);

    for (let i = 1; i <= periodos; i++) {
      const x = n + i;
      const valorPredicho = pendiente * x + interseccion;
      const intervalo = errorEstandar * 1.96; // 95% confianza

      predicciones.push({
        periodo: i,
        valor: Math.max(0, valorPredicho),
        min: Math.max(0, valorPredicho - intervalo),
        max: valorPredicho + intervalo,
        confianza: 95,
      });
    }

    return predicciones;
  },

  /**
   * Calcular regresión lineal simple
   * y = mx + b
   */
  regresionLineal(valores) {
    const n = valores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = valores;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const interseccion = (sumY - pendiente * sumX) / n;

    return { pendiente, interseccion };
  },

  /**
   * Calcular error estándar de la regresión
   */
  calcularErrorEstandar(valores, pendiente, interseccion) {
    const n = valores.length;
    const errores = valores.map((y, i) => {
      const yPredicho = pendiente * i + interseccion;
      return Math.pow(y - yPredicho, 2);
    });

    const sumErrores = errores.reduce((a, b) => a + b, 0);
    return Math.sqrt(sumErrores / (n - 2));
  },

  /**
   * Calcular promedio móvil
   * Útil para suavizar datos y detectar tendencias
   */
  promedioMovil(valores, ventana = 3) {
    if (valores.length < ventana) {
      return valores;
    }

    const resultado = [];
    for (let i = 0; i <= valores.length - ventana; i++) {
      const suma = valores.slice(i, i + ventana).reduce((a, b) => a + b, 0);
      resultado.push(suma / ventana);
    }

    return resultado;
  },

  /**
   * Detectar estacionalidad en los datos
   * Útil para identificar patrones mensuales/anuales
   */
  detectarEstacionalidad(valores, periodo = 12) {
    if (valores.length < periodo * 2) {
      return null;
    }

    const promediosPorPeriodo = Array(periodo).fill(0);
    const conteos = Array(periodo).fill(0);

    valores.forEach((valor, i) => {
      const indice = i % periodo;
      promediosPorPeriodo[indice] += valor;
      conteos[indice]++;
    });

    const estacionalidad = promediosPorPeriodo.map((suma, i) => suma / conteos[i]);
    const promedioGeneral = estacionalidad.reduce((a, b) => a + b, 0) / periodo;

    // Normalizar
    return estacionalidad.map((val) => val / promedioGeneral);
  },

  /**
   * Predecir con estacionalidad
   * Combina regresión lineal con patrones estacionales
   */
  predecirConEstacionalidad(historico, periodos = 6, periodoEstacional = 12) {
    const tendencia = this.regresionLineal(historico);
    const estacionalidad = this.detectarEstacionalidad(historico, periodoEstacional);

    if (!estacionalidad) {
      return this.predecirConsumo(historico, periodos);
    }

    const predicciones = [];
    const n = historico.length;

    for (let i = 1; i <= periodos; i++) {
      const x = n + i;
      const valorTendencia = tendencia.pendiente * x + tendencia.interseccion;
      const indiceEstacional = (n + i - 1) % periodoEstacional;
      const factorEstacional = estacionalidad[indiceEstacional];

      const valorPredicho = valorTendencia * factorEstacional;

      predicciones.push({
        periodo: i,
        valor: Math.max(0, valorPredicho),
        tendencia: valorTendencia,
        factorEstacional,
      });
    }

    return predicciones;
  },

  /**
   * Calcular métricas de precisión
   * Útil para evaluar la calidad de las predicciones
   */
  calcularPrecision(valoresReales, valoresPredichos) {
    if (valoresReales.length !== valoresPredichos.length) {
      throw new Error('Los arrays deben tener la misma longitud');
    }

    const n = valoresReales.length;

    // MAE (Mean Absolute Error)
    const mae =
      valoresReales.reduce((sum, real, i) => {
        return sum + Math.abs(real - valoresPredichos[i]);
      }, 0) / n;

    // RMSE (Root Mean Square Error)
    const rmse = Math.sqrt(
      valoresReales.reduce((sum, real, i) => {
        return sum + Math.pow(real - valoresPredichos[i], 2);
      }, 0) / n
    );

    // MAPE (Mean Absolute Percentage Error)
    const mape =
      (valoresReales.reduce((sum, real, i) => {
        if (real === 0) return sum;
        return sum + Math.abs((real - valoresPredichos[i]) / real);
      }, 0) /
        n) *
      100;

    // R² (Coefficient of Determination)
    const mediaReal = valoresReales.reduce((a, b) => a + b, 0) / n;
    const ssRes = valoresReales.reduce((sum, real, i) => {
      return sum + Math.pow(real - valoresPredichos[i], 2);
    }, 0);
    const ssTot = valoresReales.reduce((sum, real) => {
      return sum + Math.pow(real - mediaReal, 2);
    }, 0);
    const r2 = 1 - ssRes / ssTot;

    return {
      mae,
      rmse,
      mape,
      r2,
      precision: Math.max(0, Math.min(100, (1 - mape / 100) * 100)),
    };
  },
};
