import { supabase } from '@/config/supabase.config';

export const municipioService = {
  // Obtener todos los municipios
  async getMunicipios(departamentoId = null) {
    try {
      let query = supabase
        .from('municipios')
        .select(
          `
          *,
          departamentos (
            id,
            nombre,
            region
          )
        `
        )
        .order('nombre');

      if (departamentoId) {
        query = query.eq('departamento_id', departamentoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching municipios:', error);
      return { data: null, error };
    }
  },

  // Obtener un municipio por ID
  async getMunicipioById(id) {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .select(
          `
          *,
          departamentos (
            id,
            nombre,
            region
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching municipio:', error);
      return { data: null, error };
    }
  },

  // Crear municipio
  async createMunicipio(municipioData) {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .insert([municipioData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating municipio:', error);
      return { data: null, error };
    }
  },

  // Actualizar municipio
  async updateMunicipio(id, updates) {
    try {
      const { data, error } = await supabase
        .from('municipios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating municipio:', error);
      return { data: null, error };
    }
  },

  // Eliminar municipio
  async deleteMunicipio(id) {
    try {
      const { error } = await supabase.from('municipios').delete().eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting municipio:', error);
      return { error };
    }
  },

  // Obtener estadísticas del municipio
  async getEstadisticas(municipioId) {
    try {
      // Obtener total de consumos
      const { data: consumos, error: consumosError } = await supabase
        .from('consumos')
        .select('valor_kwh')
        .eq('municipio_id', municipioId);

      if (consumosError) throw consumosError;

      // Obtener fuentes de energía del municipio
      const { data: fuentes, error: fuentesError } = await supabase
        .from('fuentes_energia')
        .select('*')
        .eq('municipio_id', municipioId);

      if (fuentesError) throw fuentesError;

      const totalConsumo = consumos.reduce((sum, c) => sum + Number(c.valor_kwh), 0);
      const promedioConsumo = consumos.length > 0 ? totalConsumo / consumos.length : 0;

      return {
        data: {
          totalConsumo,
          promedioConsumo,
          numeroConsumos: consumos.length,
          fuentesActivas: fuentes.filter((f) => f.estado === 'activa').length,
          totalFuentes: fuentes.length,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching municipio estadisticas:', error);
      return { data: null, error };
    }
  },
};
