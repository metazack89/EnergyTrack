import { supabase } from '@/config/supabase.config';

export const prediccionService = {
  // Obtener predicciones
  async getPredicciones(filters = {}) {
    try {
      let query = supabase
        .from('predicciones')
        .select(
          `
          *,
          municipios (
            id,
            nombre,
            departamentos (nombre)
          ),
          fuentes_energia (
            id,
            tipo,
            nombre
          )
        `
        )
        .order('anio_predicho', { ascending: true })
        .order('mes_predicho', { ascending: true });

      if (filters.municipioId) {
        query = query.eq('municipio_id', filters.municipioId);
      }
      if (filters.fuenteId) {
        query = query.eq('fuente_id', filters.fuenteId);
      }
      if (filters.anio) {
        query = query.eq('anio_predicho', filters.anio);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching predicciones:', error);
      return { data: null, error };
    }
  },

  // Crear predicción
  async createPrediccion(prediccionData) {
    try {
      const { data, error } = await supabase
        .from('predicciones')
        .insert([prediccionData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating prediccion:', error);
      return { data: null, error };
    }
  },

  // Generar predicciones para un municipio
  async generarPredicciones(municipioId, mesesFuturos = 6) {
    try {
      // Obtener histórico de consumos
      const { data: historico, error: historicoError } = await supabase
        .from('consumos')
        .select('valor_kwh, mes, anio, fuente_id')
        .eq('municipio_id', municipioId)
        .order('anio', { ascending: true })
        .order('mes', { ascending: true });

      if (historicoError) throw historicoError;

      // Agrupar por fuente
      const porFuente = historico.reduce((acc, consumo) => {
        const fuenteId = consumo.fuente_id;
        if (!acc[fuenteId]) acc[fuenteId] = [];
        acc[fuenteId].push(Number(consumo.valor_kwh));
        return acc;
      }, {});

      // Generar predicciones usando regresión lineal simple
      const predicciones = [];
      const fechaActual = new Date();

      for (const [fuenteId, valores] of Object.entries(porFuente)) {
        const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
        const tendencia = this.calcularTendencia(valores);

        for (let i = 1; i <= mesesFuturos; i++) {
          const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i);
          const valorPredicho = promedio + tendencia * i;
          const intervalo = valorPredicho * 0.1; // 10% de margen

          predicciones.push({
            municipio_id: municipioId,
            fuente_id: parseInt(fuenteId),
            mes_predicho: fecha.getMonth() + 1,
            anio_predicho: fecha.getFullYear(),
            valor_predicho: Math.max(0, valorPredicho),
            intervalo_confianza_min: Math.max(0, valorPredicho - intervalo),
            intervalo_confianza_max: valorPredicho + intervalo,
            algoritmo: 'regresion_lineal',
            precision: 85,
          });
        }
      }

      // Guardar predicciones
      const { data, error } = await supabase.from('predicciones').insert(predicciones).select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error generating predicciones:', error);
      return { data: null, error };
    }
  },

  // Calcular tendencia simple
  calcularTendencia(valores) {
    if (valores.length < 2) return 0;

    const n = valores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = valores;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return pendiente;
  },

  // Simular escenario
  async simularEscenario(municipioId, reduccionPorcentaje) {
    try {
      // Obtener consumo actual
      const { data: consumoActual, error: consumoError } = await supabase
        .from('consumos')
        .select('valor_kwh')
        .eq('municipio_id', municipioId)
        .order('fecha', { ascending: false })
        .limit(12);

      if (consumoError) throw consumoError;

      const promedioActual =
        consumoActual.reduce((sum, c) => sum + Number(c.valor_kwh), 0) / consumoActual.length;
      const nuevoConsumo = promedioActual * (1 - reduccionPorcentaje / 100);
      const ahorro = promedioActual - nuevoConsumo;
      const ahorroAnual = ahorro * 12;

      // Calcular impacto ambiental (ejemplo: kg CO2)
      const co2PorKwh = 0.233; // kg CO2 por kWh (promedio Colombia)
      const co2Ahorrado = ahorroAnual * co2PorKwh;

      return {
        data: {
          consumoActual: promedioActual,
          nuevoConsumo,
          ahorro,
          ahorroAnual,
          co2Ahorrado,
          arbolesEquivalentes: Math.round(co2Ahorrado / 21), // 1 árbol absorbe ~21 kg CO2/año
        },
        error: null,
      };
    } catch (error) {
      console.error('Error simulating escenario:', error);
      return { data: null, error };
    }
  },
};
