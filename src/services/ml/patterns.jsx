/**
 * Servicio para detectar patrones en el consumo energético
 */

export const patternsService = {
  /**
   * Detectar picos de consumo
   * Identifica valores anormalmente altos
   */
  detectarPicos(valores, umbral = 1.5) {
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const desviacion = this.calcularDesviacionEstandar(valores, promedio);

    const picos = [];
    valores.forEach((valor, i) => {
      if (valor > promedio + umbral * desviacion) {
        picos.push({
          indice: i,
          valor,
          desviacion: (valor - promedio) / desviacion,
          tipo: 'pico_alto',
        });
      } else if (valor < promedio - umbral * desviacion) {
        picos.push({
          indice: i,
          valor,
          desviacion: (promedio - valor) / desviacion,
          tipo: 'pico_bajo',
        });
      }
    });

    return picos;
  },

  /**
   * Calcular desviación estándar
   */
  calcularDesviacionEstandar(valores, promedio = null) {
    const media = promedio || valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza =
      valores.reduce((sum, val) => {
        return sum + Math.pow(val - media, 2);
      }, 0) / valores.length;

    return Math.sqrt(varianza);
  },

  /**
   * Detectar tendencia (creciente, decreciente, estable)
   */
  detectarTendencia(valores) {
    if (valores.length < 3) {
      return { tipo: 'insuficiente', pendiente: 0 };
    }

    const n = valores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = valores.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * valores[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let tipo;
    if (Math.abs(pendiente) < 0.1) {
      tipo = 'estable';
    } else if (pendiente > 0) {
      tipo = 'creciente';
    } else {
      tipo = 'decreciente';
    }

    return {
      tipo,
      pendiente,
      cambio: (pendiente / (sumY / n)) * 100, // Cambio porcentual
    };
  },

  /**
   * Identificar el mes con mayor consumo
   */
  mesConMayorConsumo(consumosPorMes) {
    const meses = [
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

    let maxConsumo = -Infinity;
    let mesPico = null;

    consumosPorMes.forEach((consumo, i) => {
      if (consumo > maxConsumo) {
        maxConsumo = consumo;
        mesPico = i;
      }
    });

    return {
      mes: meses[mesPico],
      indice: mesPico,
      valor: maxConsumo,
    };
  },

  /**
   * Detectar ciclos/patrones repetitivos
   */
  detectarCiclos(valores, longitudMinima = 3, longitudMaxima = 12) {
    const ciclos = [];

    for (let longitud = longitudMinima; longitud <= longitudMaxima; longitud++) {
      const correlacion = this.calcularAutocorrelacion(valores, longitud);

      if (correlacion > 0.7) {
        // Alta correlación
        ciclos.push({
          longitud,
          correlacion,
          fuerte: correlacion > 0.85,
        });
      }
    }

    return ciclos.sort((a, b) => b.correlacion - a.correlacion);
  },

  /**
   * Calcular autocorrelación
   * Mide qué tan similar es una serie con ella misma desplazada
   */
  calcularAutocorrelacion(valores, lag) {
    if (lag >= valores.length) {
      return 0;
    }

    const n = valores.length - lag;
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;

    let numerador = 0;
    let denominador = 0;

    for (let i = 0; i < n; i++) {
      numerador += (valores[i] - media) * (valores[i + lag] - media);
    }

    for (let i = 0; i < valores.length; i++) {
      denominador += Math.pow(valores[i] - media, 2);
    }

    return denominador === 0 ? 0 : numerador / denominador;
  },

  /**
   * Comparar dos periodos
   * Útil para comparar año actual vs año anterior
   */
  compararPeriodos(periodo1, periodo2) {
    const suma1 = periodo1.reduce((a, b) => a + b, 0);
    const suma2 = periodo2.reduce((a, b) => a + b, 0);

    const promedio1 = suma1 / periodo1.length;
    const promedio2 = suma2 / periodo2.length;

    const cambio = ((suma1 - suma2) / suma2) * 100;
    const cambioPromedio = ((promedio1 - promedio2) / promedio2) * 100;

    return {
      periodo1: {
        total: suma1,
        promedio: promedio1,
      },
      periodo2: {
        total: suma2,
        promedio: promedio2,
      },
      cambioTotal: cambio,
      cambioPromedio,
      aumentado: cambio > 0,
    };
  },

  /**
   * Agrupar consumos por categoría
   */
  categorizarConsumo(valor, promedioHistorico) {
    const porcentaje = (valor / promedioHistorico - 1) * 100;

    if (porcentaje > 50) return { categoria: 'muy_alto', severidad: 'critica' };
    if (porcentaje > 25) return { categoria: 'alto', severidad: 'alta' };
    if (porcentaje > -10 && porcentaje <= 25) return { categoria: 'normal', severidad: 'media' };
    if (porcentaje > -25) return { categoria: 'bajo', severidad: 'baja' };
    return { categoria: 'muy_bajo', severidad: 'baja' };
  },
};
