import { supabase } from '@/config/supabase.config';

export const fuenteService = {
  // Obtener todas las fuentes de energía
  async getFuentes(filters = {}) {
    try {
      let query = supabase
        .from('fuentes_energia')
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
        .order('nombre');

      if (filters.municipioId) {
        query = query.eq('municipio_id', filters.municipioId);
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching fuentes:', error);
      return { data: null, error };
    }
  },

  // Obtener fuente por ID
  async getFuenteById(id) {
    try {
      const { data, error } = await supabase
        .from('fuentes_energia')
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
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching fuente:', error);
      return { data: null, error };
    }
  },

  // Crear fuente de energía
  async createFuente(fuenteData) {
    try {
      const { data, error } = await supabase
        .from('fuentes_energia')
        .insert([fuenteData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating fuente:', error);
      return { data: null, error };
    }
  },

  // Actualizar fuente
  async updateFuente(id, updates) {
    try {
      const { data, error } = await supabase
        .from('fuentes_energia')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating fuente:', error);
      return { data: null, error };
    }
  },

  // Eliminar fuente
  async deleteFuente(id) {
    try {
      const { error } = await supabase.from('fuentes_energia').delete().eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting fuente:', error);
      return { error };
    }
  },

  // Cambiar estado de fuente
  async cambiarEstado(id, nuevoEstado) {
    try {
      const { data, error } = await supabase
        .from('fuentes_energia')
        .update({ estado: nuevoEstado })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error changing estado:', error);
      return { data: null, error };
    }
  },

  // Obtener capacidad total por tipo
  async getCapacidadPorTipo(municipioId = null) {
    try {
      let query = supabase
        .from('fuentes_energia')
        .select('tipo, capacidad_mw')
        .eq('estado', 'activa');

      if (municipioId) {
        query = query.eq('municipio_id', municipioId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por tipo
      const grouped = data.reduce((acc, fuente) => {
        const tipo = fuente.tipo;
        acc[tipo] = (acc[tipo] || 0) + Number(fuente.capacidad_mw || 0);
        return acc;
      }, {});

      return { data: grouped, error: null };
    } catch (error) {
      console.error('Error fetching capacidad:', error);
      return { data: null, error };
    }
  },
};
