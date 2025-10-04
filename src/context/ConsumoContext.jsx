import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase.config';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ConsumoContext = createContext({});

export const useConsumo = () => {
  const context = useContext(ConsumoContext);
  if (!context) {
    throw new Error('useConsumo debe usarse dentro de ConsumoProvider');
  }
  return context;
};

export const ConsumoProvider = ({ children }) => {
  const { profile } = useAuth();
  const [consumos, setConsumos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [fuentesEnergia, setFuentesEnergia] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    municipioId: null,
    fechaInicio: null,
    fechaFin: null,
    fuenteId: null,
    tipoConsumo: null,
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (profile) {
      loadInitialData();
    }
  }, [profile]);

  // Recargar consumos cuando cambien los filtros
  useEffect(() => {
    if (filters.municipioId) {
      fetchConsumos();
    }
  }, [filters]);

  const loadInitialData = async () => {
    await Promise.all([fetchDepartamentos(), fetchMunicipios(), fetchFuentesEnergia()]);
  };

  const fetchDepartamentos = async () => {
    try {
      const { data, error } = await supabase.from('departamentos').select('*').order('nombre');

      if (error) throw error;
      setDepartamentos(data || []);
    } catch (error) {
      console.error('Error fetching departamentos:', error);
    }
  };

  const fetchMunicipios = async () => {
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

      // Si el usuario tiene un departamento asignado, filtrar
      if (profile?.departamento_id) {
        query = query.eq('departamento_id', profile.departamento_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMunicipios(data || []);
    } catch (error) {
      console.error('Error fetching municipios:', error);
      toast.error('Error al cargar municipios');
    }
  };

  const fetchFuentesEnergia = async () => {
    try {
      const { data, error } = await supabase
        .from('fuentes_energia')
        .select('*')
        .eq('estado', 'activa')
        .order('nombre');

      if (error) throw error;
      setFuentesEnergia(data || []);
    } catch (error) {
      console.error('Error fetching fuentes:', error);
      toast.error('Error al cargar fuentes de energía');
    }
  };

  const fetchConsumos = async () => {
    try {
      setLoading(true);

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
              nombre
            )
          ),
          fuentes_energia (
            id,
            tipo,
            nombre
          )
        `
        )
        .order('fecha', { ascending: false });

      // Aplicar filtros
      if (filters.municipioId) {
        query = query.eq('municipio_id', filters.municipioId);
      }
      if (filters.fechaInicio) {
        query = query.gte('fecha', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha', filters.fechaFin);
      }
      if (filters.fuenteId) {
        query = query.eq('fuente_id', filters.fuenteId);
      }
      if (filters.tipoConsumo) {
        query = query.eq('tipo_consumo', filters.tipoConsumo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConsumos(data || []);
    } catch (error) {
      console.error('Error fetching consumos:', error);
      toast.error('Error al cargar consumos');
    } finally {
      setLoading(false);
    }
  };

  const registrarConsumo = async (consumoData) => {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .insert([
          {
            ...consumoData,
            user_id: profile.id,
          },
        ])
        .select(
          `
          *,
          municipios (nombre),
          fuentes_energia (tipo, nombre)
        `
        )
        .single();

      if (error) throw error;

      setConsumos((prev) => [data, ...prev]);
      toast.success('Consumo registrado exitosamente');

      return { data, error: null };
    } catch (error) {
      console.error('Error registering consumo:', error);
      toast.error('Error al registrar consumo');
      return { data: null, error };
    }
  };

  const actualizarConsumo = async (consumoId, updates) => {
    try {
      const { data, error } = await supabase
        .from('consumos')
        .update(updates)
        .eq('id', consumoId)
        .select(
          `
          *,
          municipios (nombre),
          fuentes_energia (tipo, nombre)
        `
        )
        .single();

      if (error) throw error;

      setConsumos((prev) => prev.map((c) => (c.id === consumoId ? data : c)));
      toast.success('Consumo actualizado exitosamente');

      return { data, error: null };
    } catch (error) {
      console.error('Error updating consumo:', error);
      toast.error('Error al actualizar consumo');
      return { data: null, error };
    }
  };

  const eliminarConsumo = async (consumoId) => {
    try {
      const { error } = await supabase.from('consumos').delete().eq('id', consumoId);

      if (error) throw error;

      setConsumos((prev) => prev.filter((c) => c.id !== consumoId));
      toast.success('Consumo eliminado exitosamente');

      return { error: null };
    } catch (error) {
      console.error('Error deleting consumo:', error);
      toast.error('Error al eliminar consumo');
      return { error };
    }
  };

  const getEstadisticas = useCallback(() => {
    if (consumos.length === 0) return null;

    const total = consumos.reduce((sum, c) => sum + Number(c.valor_kwh), 0);
    const promedio = total / consumos.length;
    const maximo = Math.max(...consumos.map((c) => Number(c.valor_kwh)));
    const minimo = Math.min(...consumos.map((c) => Number(c.valor_kwh)));

    // Agrupar por mes
    const porMes = consumos.reduce((acc, c) => {
      const key = `${c.anio}-${String(c.mes).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + Number(c.valor_kwh);
      return acc;
    }, {});

    // Agrupar por fuente
    const porFuente = consumos.reduce((acc, c) => {
      const tipo = c.fuentes_energia?.tipo || 'Desconocido';
      acc[tipo] = (acc[tipo] || 0) + Number(c.valor_kwh);
      return acc;
    }, {});

    return {
      total,
      promedio,
      maximo,
      minimo,
      cantidad: consumos.length,
      porMes,
      porFuente,
    };
  }, [consumos]);

  const value = {
    consumos,
    municipios,
    fuentesEnergia,
    departamentos,
    loading,
    filters,
    setFilters,
    fetchConsumos,
    registrarConsumo,
    actualizarConsumo,
    eliminarConsumo,
    getEstadisticas,
    refetch: loadInitialData,
  };

  return <ConsumoContext.Provider value={value}>{children}</ConsumoContext.Provider>;
};
