/**
 * Análisis de series temporales
 * Funciones avanzadas para el análisis de datos temporales
 */

export const timeseriesService = {
  /**
   * Descomponer serie temporal en: tendencia, estacionalidad y residuo
   */
  descomponerSerie(valores, periodo = 12) {
    if (valores.length < periodo * 2) {
      return null;
    }

    // 1. Calcular tendencia usando promedio móvil centrado
    const tendencia = this.calcularTendencia(valores, periodo);

    // 2. Calcular componente estacional
    const estacionalidad = this.calcularEstacionalidad(valores, tendencia, periodo);

    // 3. Calcular residuo
    const residuo = valores.map((val, i) => {
      const t = tendencia[i] || val;
      const s = estacionalidad[i % periodo] || 1;
      return val - t * s;
    });

    return {
      tendencia,
      estacionalidad,
      residuo,
      original: valores,
    };
  },

  /**
   * Calcular tendencia usando promedio móvil
   */
  calcularTendencia(valores, ventana) {
    const tendencia = [];
    const mitad = Math.floor(ventana / 2);

    for (let i = 0; i < valores.length; i++) {
      const inicio = Math.max(0, i - mitad);
      const fin = Math.min(valores.length, i + mitad + 1);
      const ventanaActual = valores.slice(inicio, fin);
      const promedio = ventanaActual.reduce((a, b) => a + b, 0) / ventanaActual.length;
      tendencia.push(promedio);
    }

    return tendencia;
  },

  /**
   * Calcular componente estacional
   */
  calcularEstacionalidad(valores, tendencia, periodo) {
    const factoresEstacionales = Array(periodo).fill(0);
    const conteos = Array(periodo).fill(0);

    valores.forEach((val, i) => {
      if (tendencia[i] && tendencia[i] !== 0) {
        const indice = i % periodo;
        factoresEstacionales[indice] += val / tendencia[i];
        conteos[indice]++;
      }
    });

    // Calcular promedio de cada periodo
    const estacionalidad = factoresEstacionales.map((sum, i) =>
      conteos[i] > 0 ? sum / conteos[i] : 1
    );

    // Normalizar para que el promedio sea 1
    const promedioEstacional = estacionalidad.reduce((a, b) => a + b, 0) / periodo;
    return estacionalidad.map((val) => val / promedioEstacional);
  },

  /**
   * Suavizado exponencial simple
   * Útil para predicciones a corto plazo
   */
  suavizadoExponencial(valores, alpha = 0.3) {
    if (alpha < 0 || alpha > 1) {
      throw new Error('Alpha debe estar entre 0 y 1');
    }

    const suavizado = [valores[0]];

    for (let i = 1; i < valores.length; i++) {
      const s = alpha * valores[i] + (1 - alpha) * suavizado[i - 1];
      suavizado.push(s);
    }

    return suavizado;
  },

  /**
   * Suavizado exponencial doble (Holt)
   * Considera tendencia
   */
  suavizadoHolt(valores, alpha = 0.3, beta = 0.1) {
    const nivel = [valores[0]];
    const tendencia = [valores[1] - valores[0]];
    const prediccion = [valores[0]];

    for (let i = 1; i < valores.length; i++) {
      const nivelAnterior = nivel[i - 1];
      const tendenciaAnterior = tendencia[i - 1];

      const nuevoNivel = alpha * valores[i] + (1 - alpha) * (nivelAnterior + tendenciaAnterior);
      const nuevaTendencia = beta * (nuevoNivel - nivelAnterior) + (1 - beta) * tendenciaAnterior;

      nivel.push(nuevoNivel);
      tendencia.push(nuevaTendencia);
      prediccion.push(nuevoNivel + nuevaTendencia);
    }

    return {
      nivel,
      tendencia,
      prediccion,
      predecirSiguiente: () => nivel[nivel.length - 1] + tendencia[tendencia.length - 1],
    };
  },

  /**
   * Suavizado exponencial triple (Holt-Winters)
   * Considera tendencia y estacionalidad
   */
  suavizadoHoltWinters(valores, periodo = 12, alpha = 0.3, beta = 0.1, gamma = 0.1) {
    if (valores.length < periodo * 2) {
      throw new Error('Se necesitan al menos 2 ciclos completos de datos');
    }

    // Inicializar componentes
    const nivel = [];
    const tendencia = [];
    const estacionalidad = Array(periodo).fill(1);
    const prediccion = [];

    // Calcular valores iniciales
    nivel[0] = valores.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo;
    tendencia[0] =
      (valores.slice(periodo, periodo * 2).reduce((a, b) => a + b, 0) / periodo - nivel[0]) /
      periodo;

    // Estacionalidad inicial
    for (let i = 0; i < periodo; i++) {
      estacionalidad[i] = valores[i] / nivel[0];
    }

    // Aplicar algoritmo
    for (let i = 0; i < valores.length; i++) {
      const indiceEstacional = i % periodo;
      const estacionalidadActual = estacionalidad[indiceEstacional];

      if (i === 0) {
        prediccion[i] = valores[i];
        continue;
      }

      const nivelAnterior = nivel[i - 1];
      const tendenciaAnterior = tendencia[i - 1];

      // Actualizar componentes
      const nuevoNivel =
        alpha * (valores[i] / estacionalidadActual) +
        (1 - alpha) * (nivelAnterior + tendenciaAnterior);
      const nuevaTendencia = beta * (nuevoNivel - nivelAnterior) + (1 - beta) * tendenciaAnterior;
      const nuevaEstacionalidad =
        gamma * (valores[i] / nuevoNivel) + (1 - gamma) * estacionalidadActual;

      nivel.push(nuevoNivel);
      tendencia.push(nuevaTendencia);
      estacionalidad[indiceEstacional] = nuevaEstacionalidad;
      prediccion.push((nivelAnterior + tendenciaAnterior) * estacionalidadActual);
    }

    return {
      nivel,
      tendencia,
      estacionalidad,
      prediccion,
      predecir: (pasos) => {
        const ultimoNivel = nivel[nivel.length - 1];
        const ultimaTendencia = tendencia[tendencia.length - 1];
        const predicciones = [];

        for (let i = 1; i <= pasos; i++) {
          const indiceEstacional = (valores.length + i - 1) % periodo;
          const pred = (ultimoNivel + i * ultimaTendencia) * estacionalidad[indiceEstacional];
          predicciones.push(pred);
        }

        return predicciones;
      },
    };
  },

  /**
   * Detectar puntos de cambio (change points)
   * Identifica momentos donde el comportamiento de la serie cambia significativamente
   */
  detectarCambios(valores, umbral = 2) {
    const cambios = [];
    const ventana = Math.min(10, Math.floor(valores.length / 4));

    for (let i = ventana; i < valores.length - ventana; i++) {
      const antes = valores.slice(i - ventana, i);
      const despues = valores.slice(i, i + ventana);

      const promedioAntes = antes.reduce((a, b) => a + b, 0) / antes.length;
      const promedioDespues = despues.reduce((a, b) => a + b, 0) / despues.length;

      const desviacionAntes = this.calcularDesviacion(antes, promedioAntes);
      const desviacionDespues = this.calcularDesviacion(despues, promedioDespues);

      const diferencia = Math.abs(promedioDespues - promedioAntes);
      const desviacionCombinada = (desviacionAntes + desviacionDespues) / 2;

      if (diferencia > umbral * desviacionCombinada) {
        cambios.push({
          indice: i,
          fecha: i,
          promedioAntes,
          promedioDespues,
          cambio: promedioDespues - promedioAntes,
          cambioRelativo: ((promedioDespues - promedioAntes) / promedioAntes) * 100,
        });
      }
    }

    return cambios;
  },

  calcularDesviacion(valores, promedio) {
    const varianza =
      valores.reduce((sum, val) => {
        return sum + Math.pow(val - promedio, 2);
      }, 0) / valores.length;
    return Math.sqrt(varianza);
  },

  /**
   * Calcular ACF (Autocorrelation Function)
   * Útil para identificar patrones y ciclos
   */
  calcularACF(valores, maxLag = 20) {
    const n = valores.length;
    const media = valores.reduce((a, b) => a + b, 0) / n;
    const acf = [];

    for (let lag = 0; lag <= maxLag; lag++) {
      let numerador = 0;
      let denominador = 0;

      for (let i = 0; i < n - lag; i++) {
        numerador += (valores[i] - media) * (valores[i + lag] - media);
      }

      for (let i = 0; i < n; i++) {
        denominador += Math.pow(valores[i] - media, 2);
      }

      acf.push({
        lag,
        correlacion: denominador === 0 ? 0 : numerador / denominador,
      });
    }

    return acf;
  },

  /**
   * Calcular PACF (Partial Autocorrelation Function)
   */
  calcularPACF(valores, maxLag = 20) {
    const acf = this.calcularACF(valores, maxLag);
    const pacf = [{ lag: 0, correlacion: 1 }];

    for (let lag = 1; lag <= maxLag; lag++) {
      // Algoritmo de Durbin-Levinson simplificado
      let suma = 0;
      for (let i = 1; i < lag; i++) {
        suma += pacf[i].correlacion * acf[lag - i].correlacion;
      }

      const parcial = (acf[lag].correlacion - suma) / (1 - suma);
      pacf.push({ lag, correlacion: parcial });
    }

    return pacf;
  },

  /**
   * Test de estacionariedad (ADF simplificado)
   * Verifica si la serie es estacionaria
   */
  testEstacionariedad(valores) {
    // Calcular diferencias de primer orden
    const diferencias = [];
    for (let i = 1; i < valores.length; i++) {
      diferencias.push(valores[i] - valores[i - 1]);
    }

    // Calcular estadísticas básicas
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza =
      valores.reduce((sum, val) => {
        return sum + Math.pow(val - media, 2);
      }, 0) / valores.length;

    // Dividir serie en dos mitades
    const mitad = Math.floor(valores.length / 2);
    const primeraParteMedia = valores.slice(0, mitad).reduce((a, b) => a + b, 0) / mitad;
    const segundaParteMedia =
      valores.slice(mitad).reduce((a, b) => a + b, 0) / (valores.length - mitad);

    // Cambio significativo en la media indica no estacionariedad
    const cambioMedia = Math.abs(segundaParteMedia - primeraParteMedia) / media;

    return {
      esEstacionaria: cambioMedia < 0.2, // Heurística simple
      cambioMedia,
      media,
      varianza,
      diferencias,
      recomendacion: cambioMedia >= 0.2 ? 'Aplicar diferenciación' : 'Serie estacionaria',
    };
  },

  /**
   * Aplicar diferenciación
   * Convierte serie no estacionaria en estacionaria
   */
  diferenciar(valores, orden = 1) {
    let resultado = valores;

    for (let i = 0; i < orden; i++) {
      const temp = [];
      for (let j = 1; j < resultado.length; j++) {
        temp.push(resultado[j] - resultado[j - 1]);
      }
      resultado = temp;
    }

    return resultado;
  },

  /**
   * Integrar (reverso de diferenciar)
   */
  integrar(diferencias, valorInicial) {
    const resultado = [valorInicial];

    for (let i = 0; i < diferencias.length; i++) {
      resultado.push(resultado[resultado.length - 1] + diferencias[i]);
    }

    return resultado;
  },

  /**
   * Calcular métricas de error de predicción
   */
  calcularErrores(valoresReales, valoresPredichos) {
    if (valoresReales.length !== valoresPredichos.length) {
      throw new Error('Los arrays deben tener la misma longitud');
    }

    const n = valoresReales.length;
    const errores = valoresReales.map((real, i) => real - valoresPredichos[i]);

    // MAE (Mean Absolute Error)
    const mae = errores.reduce((sum, err) => sum + Math.abs(err), 0) / n;

    // MSE (Mean Squared Error)
    const mse = errores.reduce((sum, err) => sum + err * err, 0) / n;

    // RMSE (Root Mean Square Error)
    const rmse = Math.sqrt(mse);

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
    const ssRes = errores.reduce((sum, err) => sum + err * err, 0);
    const ssTot = valoresReales.reduce((sum, real) => {
      return sum + Math.pow(real - mediaReal, 2);
    }, 0);
    const r2 = 1 - ssRes / ssTot;

    return {
      mae,
      mse,
      rmse,
      mape,
      r2,
      errores,
    };
  },

  /**
   * Análisis de residuos
   * Verifica la calidad del modelo
   */
  analizarResiduos(residuos) {
    const n = residuos.length;
    const media = residuos.reduce((a, b) => a + b, 0) / n;
    const varianza =
      residuos.reduce((sum, r) => {
        return sum + Math.pow(r - media, 2);
      }, 0) / n;
    const desviacion = Math.sqrt(varianza);

    // Test de normalidad simple (asimetría y curtosis)
    const asimetria =
      residuos.reduce((sum, r) => {
        return sum + Math.pow((r - media) / desviacion, 3);
      }, 0) / n;

    const curtosis =
      residuos.reduce((sum, r) => {
        return sum + Math.pow((r - media) / desviacion, 4);
      }, 0) /
        n -
      3;

    // ACF de residuos (debería ser cercano a 0)
    const acfResiduos = this.calcularACF(residuos, 10);
    const autocorrelacionSignificativa = acfResiduos.some(
      (item, i) => i > 0 && Math.abs(item.correlacion) > 0.2
    );

    return {
      media,
      varianza,
      desviacion,
      asimetria,
      curtosis,
      autocorrelacionSignificativa,
      esRuidoBlanco: !autocorrelacionSignificativa && Math.abs(media) < 0.1,
      calidad: {
        buena: !autocorrelacionSignificativa && Math.abs(media) < 0.1,
        aceptable: !autocorrelacionSignificativa || Math.abs(media) < 0.2,
        pobre: autocorrelacionSignificativa && Math.abs(media) >= 0.2,
      },
    };
  },

  /**
   * Validación cruzada para series temporales
   * Split temporal para evaluar modelo
   */
  validacionCruzadaTemporal(valores, porcentajeEntrenamiento = 0.8) {
    const n = valores.length;
    const nEntrenamiento = Math.floor(n * porcentajeEntrenamiento);

    const entrenamiento = valores.slice(0, nEntrenamiento);
    const prueba = valores.slice(nEntrenamiento);

    return {
      entrenamiento,
      prueba,
      nEntrenamiento,
      nPrueba: prueba.length,
    };
  },

  /**
   * Forecast con intervalo de confianza
   */
  forecastConIntervalo(valores, pasos, metodo = 'exponencial', nivel = 0.95) {
    const z = 1.96; // Para 95% de confianza

    let predicciones = [];
    let errorEstandar = 0;

    if (metodo === 'exponencial') {
      const resultado = this.suavizadoExponencial(valores);
      const ultimoValor = resultado[resultado.length - 1];

      // Calcular error estándar
      const errores = valores.slice(1).map((v, i) => v - resultado[i]);
      errorEstandar = Math.sqrt(errores.reduce((sum, e) => sum + e * e, 0) / errores.length);

      for (let i = 1; i <= pasos; i++) {
        const pred = ultimoValor;
        const intervalo = z * errorEstandar * Math.sqrt(i);

        predicciones.push({
          paso: i,
          prediccion: pred,
          limiteInferior: pred - intervalo,
          limiteSuperior: pred + intervalo,
        });
      }
    }

    return predicciones;
  },
};
