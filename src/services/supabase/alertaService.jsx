import { supabase } from '@/config/supabase.config';

export const alertaService = {
  // Obtener alertas
  async getAlertas(filters = {}) {
    try {
      let query = supabase
        .from('alertas')
        .select(
          `
          *,
          municipios (
            id,
            nombre,
            departamentos (nombre)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (filters.leida !== undefined) {
        query = query.eq('leida', filters.leida);
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters.severidad) {
        query = query.eq('severidad', filters.severidad);
      }
      if (filters.municipioId) {
        query = query.eq('municipio_id', filters.municipioId);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching alertas:', error);
      return { data: null, error };
    }
  },

  // Crear alerta
  async createAlerta(alertaData) {
    try {
      const { data, error } = await supabase.from('alertas').insert([alertaData]).select().single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating alerta:', error);
      return { data: null, error };
    }
  },

  // Marcar alerta como leída
  async marcarComoLeida(alertaId) {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('id', alertaId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking alerta as read:', error);
      return { data: null, error };
    }
  },

  // Marcar todas como leídas
  async marcarTodasComoLeidas(userId) {
    try {
      const { error } = await supabase.from('alertas').update({ leida: true }).eq('leida', false);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error marking all alertas as read:', error);
      return { error };
    }
  },

  // Eliminar alerta
  async deleteAlerta(alertaId) {
    try {
      const { error } = await supabase.from('alertas').delete().eq('id', alertaId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting alerta:', error);
      return { error };
    }
  },

  // Detectar y crear alertas automáticas
  async detectarAlertasAutomaticas(municipioId) {
    try {
      // Obtener consumos recientes
      const { data: consumos, error: consumosError } = await supabase
        .from('consumos')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('fecha', { ascending: false })
        .limit(30);

      if (consumosError) throw consumosError;

      const valores = consumos.map((c) => Number(c.valor_kwh));
      const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
      const ultimoValor = valores[0];

      const alertas = [];

      // Alerta por consumo alto (> 50% del promedio)
      if (ultimoValor > promedio * 1.5) {
        alertas.push({
          tipo: 'alto_consumo',
          severidad: ultimoValor > promedio * 2 ? 'critica' : 'alta',
          mensaje: `Consumo anormalmente alto detectado: ${ultimoValor.toFixed(2)} kWh (${(
            (ultimoValor / promedio - 1) *
            100
          ).toFixed(0)}% sobre el promedio)`,
          municipio_id: municipioId,
          consumo_id: consumos[0].id,
          leida: false,
        });
      }

      // Alerta por tendencia creciente sostenida
      const ultimos5 = valores.slice(0, 5);
      const esCreciente = ultimos5.every((val, i) => i === 0 || val >= ultimos5[i - 1]);

      if (esCreciente && ultimos5.length === 5) {
        alertas.push({
          tipo: 'anomalia',
          severidad: 'media',
          mensaje: 'Se detectó una tendencia de consumo creciente en los últimos 5 registros',
          municipio_id: municipioId,
          leida: false,
        });
      }

      // Guardar alertas
      if (alertas.length > 0) {
        const { data, error } = await supabase.from('alertas').insert(alertas).select();

        if (error) throw error;
        return { data, error: null };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('Error detecting alertas automaticas:', error);
      return { data: null, error };
    }
  },
};
