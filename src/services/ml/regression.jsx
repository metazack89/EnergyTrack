/**
 * Implementación de diferentes tipos de regresión
 */

export const regressionService = {
  /**
   * Regresión lineal simple
   * y = mx + b
   */
  lineal(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    return {
      pendiente: m,
      interseccion: b,
      predecir: (xVal) => m * xVal + b,
    };
  },

  /**
   * Regresión polinómica de grado 2
   * y = ax² + bx + c
   */
  polinomialGrado2(x, y) {
    const n = x.length;

    // Calcular sumas necesarias
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumX3 = x.reduce((sum, xi) => sum + Math.pow(xi, 3), 0);
    const sumX4 = x.reduce((sum, xi) => sum + Math.pow(xi, 4), 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * y[i], 0);

    // Resolver sistema de ecuaciones (método de Cramer simplificado)
    const a =
      (sumX2Y * (sumX * n - sumX * sumX) - sumXY * (sumX2 * n - sumX * sumX)) /
      (sumX4 * (sumX * n - sumX * sumX) - sumX2 * (sumX2 * n - sumX * sumX));

    const b = (sumXY - a * sumX2) / sumX;
    const c = (sumY - a * sumX2 - b * sumX) / n;

    return {
      a,
      b,
      c,
      predecir: (xVal) => a * xVal * xVal + b * xVal + c,
    };
  },

  /**
   * Regresión exponencial
   * y = a * e^(bx)
   */
  exponencial(x, y) {
    // Transformar a lineal: ln(y) = ln(a) + bx
    const lnY = y.map((val) => Math.log(val));
    const lineal = this.lineal(x, lnY);

    const a = Math.exp(lineal.interseccion);
    const b = lineal.pendiente;

    return {
      a,
      b,
      predecir: (xVal) => a * Math.exp(b * xVal),
    };
  },

  /**
   * Regresión logarítmica
   * y = a + b * ln(x)
   */
  logaritmica(x, y) {
    const lnX = x.map((val) => Math.log(val));
    const lineal = this.lineal(lnX, y);

    return {
      a: lineal.interseccion,
      b: lineal.pendiente,
      predecir: (xVal) => lineal.interseccion + lineal.pendiente * Math.log(xVal),
    };
  },

  /**
   * Elegir el mejor modelo de regresión
   * Compara diferentes modelos y retorna el de mejor ajuste
   */
  mejorModelo(x, y) {
    const modelos = {
      lineal: this.lineal(x, y),
      polinomial: this.polinomialGrado2(x, y),
    };

    // Calcular R² para cada modelo
    const r2Scores = {};
    const mediaY = y.reduce((a, b) => a + b, 0) / y.length;

    for (const [nombre, modelo] of Object.entries(modelos)) {
      const predicciones = x.map((xi) => modelo.predecir(xi));

      const ssRes = y.reduce((sum, yi, i) => {
        return sum + Math.pow(yi - predicciones[i], 2);
      }, 0);

      const ssTot = y.reduce((sum, yi) => {
        return sum + Math.pow(yi - mediaY, 2);
      }, 0);

      r2Scores[nombre] = 1 - ssRes / ssTot;
    }

    // Encontrar mejor modelo
    const mejorNombre = Object.keys(r2Scores).reduce((a, b) => (r2Scores[a] > r2Scores[b] ? a : b));

    return {
      nombre: mejorNombre,
      modelo: modelos[mejorNombre],
      r2: r2Scores[mejorNombre],
      precision: r2Scores[mejorNombre] * 100,
    };
  },
};
