import { supabase } from '@/config/supabase.config';

export const consumoService = {
  // Obtener todos los consumos con filtros
  async getConsumos(filters = {}) {
    try {
      let query = supabase
        .from('consumos')
        .select(
          `
          *,
          municipios (
            id,
            nombre,
            departamentos (
              id,
              nombre,
              region
            )
          ),
          fuentes_energia (
            id,
            tipo,
            nombre
          ),
          profiles:user_id (
            id,
            full_name,
            email
          )
        `
        )
        .order('fecha', { ascending: false });

      // Aplicar filtros
      if (filters.municipioId) {
        query = query.eq('municipio_id', filters.municipioId);
      }
      if (filters.fuenteId) {
        query = query.eq('fuente_id', filters.fuenteId);
      }
      if (filters.tipoConsumo) {
        query = query.eq('tipo_consumo', filters.tipoConsumo);
      }
      if (filters.fechaInicio) {
        query = query.gte('fecha', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha', filters.fechaFin);
      }
      if (filters.mes) {
        query = query.eq('mes', filters.mes);
      }
      if (filters.anio) {
        query = query.eq('anio', filters.anio);
      }

      // Paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching consumos:', error);
      return { data: null, error };
    }
  },

  // Obtener un consumo por ID
  async getConsumoById(id) {
    try {
      const { data, error } = await supabase
        .from('consumos')
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
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching consumo:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo consumo
  async createConsumo(consumoData) {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .insert([consumoData])
        .select(
          `
          *,
          municipios (nombre),
          fuentes_energia (tipo, nombre)
        `
        )
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating consumo:', error);
      return { data: null, error };
    }
  },

  // Actualizar consumo
  async updateConsumo(id, updates) {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .update(updates)
        .eq('id', id)
        .select(
          `
          *,
          municipios (nombre),
          fuentes_energia (tipo, nombre)
        `
        )
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating consumo:', error);
      return { data: null, error };
    }
  },

  // Eliminar consumo
  async deleteConsumo(id) {
    try {
      const { error } = await supabase.from('consumos').delete().eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting consumo:', error);
      return { error };
    }
  },

  // Obtener estadísticas de consumo por municipio
  async getEstadisticasByMunicipio(municipioId, anio) {
    try {
      const { data, error } = await supabase.rpc('calcular_estadisticas_mensuales', {
        p_municipio_id: municipioId,
        p_anio: anio,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      return { data: null, error };
    }
  },

  // Obtener consumo total por fuente
  async getConsumoByFuente(municipioId, fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .select(
          `
          valor_kwh,
          fuentes_energia (
            tipo,
            nombre
          )
        `
        )
        .eq('municipio_id', municipioId)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      if (error) throw error;

      // Agrupar por tipo de fuente
      const grouped = data.reduce((acc, item) => {
        const tipo = item.fuentes_energia?.tipo || 'Desconocido';
        acc[tipo] = (acc[tipo] || 0) + Number(item.valor_kwh);
        return acc;
      }, {});

      return { data: grouped, error: null };
    } catch (error) {
      console.error('Error fetching consumo by fuente:', error);
      return { data: null, error };
    }
  },

  // Obtener tendencia mensual
  async getTendenciaMensual(municipioId, meses = 12) {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .select('valor_kwh, mes, anio')
        .eq('municipio_id', municipioId)
        .order('anio', { ascending: true })
        .order('mes', { ascending: true })
        .limit(meses);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tendencia:', error);
      return { data: null, error };
    }
  },

  // Comparar consumo entre municipios
  async compararMunicipios(municipioIds, anio) {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .select(
          `
          valor_kwh,
          municipio_id,
          municipios (nombre)
        `
        )
        .in('municipio_id', municipioIds)
        .eq('anio', anio);

      if (error) throw error;

      // Agrupar por municipio
      const grouped = data.reduce((acc, item) => {
        const municipio = item.municipios?.nombre || 'Desconocido';
        if (!acc[municipio]) {
          acc[municipio] = { total: 0, count: 0 };
        }
        acc[municipio].total += Number(item.valor_kwh);
        acc[municipio].count += 1;
        return acc;
      }, {});

      // Calcular promedios
      const result = Object.entries(grouped).map(([municipio, stats]) => ({
        municipio,
        total: stats.total,
        promedio: stats.total / stats.count,
      }));

      return { data: result, error: null };
    } catch (error) {
      console.error('Error comparing municipios:', error);
      return { data: null, error };
    }
  },

  // Detectar anomalías (consumos anormalmente altos)
  async detectarAnomalias(municipioId, umbral = 1.5) {
    try {
      // Obtener todos los consumos del municipio
      const { data: consumos, error } = await supabase
        .from('consumos')
        .select('*')
        .eq('municipio_id', municipioId);

      if (error) throw error;

      // Calcular promedio y desviación estándar
      const valores = consumos.map((c) => Number(c.valor_kwh));
      const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
      const desviacion = Math.sqrt(
        valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length
      );

      // Detectar anomalías
      const anomalias = consumos.filter((c) => {
        const valor = Number(c.valor_kwh);
        return Math.abs(valor - promedio) > umbral * desviacion;
      });

      return { data: anomalias, error: null };
    } catch (error) {
      console.error('Error detecting anomalias:', error);
      return { data: null, error };
    }
  },

  // Exportar datos a CSV
  async exportarCSV(filters = {}) {
    try {
      const { data, error } = await this.getConsumos(filters);
      if (error) throw error;

      // Convertir a CSV
      const headers = [
        'Fecha',
        'Municipio',
        'Fuente',
        'Tipo Consumo',
        'Valor (kWh)',
        'Observaciones',
      ];
      const rows = data.map((c) => [
        c.fecha,
        c.municipios?.nombre || '',
        c.fuentes_energia?.nombre || '',
        c.tipo_consumo || '',
        c.valor_kwh,
        c.observaciones || '',
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      return { data: csv, error: null };
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return { data: null, error };
    }
  },
};
