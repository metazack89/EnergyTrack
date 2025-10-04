import { useState, useEffect } from 'react';
import { municipioService } from '@/services/supabase/municipio.service';
import toast from 'react-hot-toast';

export const useMunicipios = (departamentoId = null) => {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMunicipios();
  }, [departamentoId]);

  const fetchMunicipios = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await municipioService.getMunicipios(departamentoId);

      if (error) throw error;

      setMunicipios(data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar municipios');
    } finally {
      setLoading(false);
    }
  };

  const getMunicipioById = async (id) => {
    try {
      const { data, error } = await municipioService.getMunicipioById(id);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      toast.error('Error al cargar municipio');
      return { data: null, error: err };
    }
  };

  const createMunicipio = async (municipioData) => {
    try {
      setLoading(true);
      const { data, error } = await municipioService.createMunicipio(municipioData);

      if (error) throw error;

      setMunicipios((prev) => [...prev, data]);
      toast.success('Municipio creado exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al crear municipio');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateMunicipio = async (id, updates) => {
    try {
      setLoading(true);
      const { data, error } = await municipioService.updateMunicipio(id, updates);

      if (error) throw error;

      setMunicipios((prev) => prev.map((m) => (m.id === id ? data : m)));
      toast.success('Municipio actualizado exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al actualizar municipio');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteMunicipio = async (id) => {
    try {
      setLoading(true);
      const { error } = await municipioService.deleteMunicipio(id);

      if (error) throw error;

      setMunicipios((prev) => prev.filter((m) => m.id !== id));
      toast.success('Municipio eliminado exitosamente');

      return { error: null };
    } catch (err) {
      toast.error('Error al eliminar municipio');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const getEstadisticas = async (municipioId) => {
    try {
      const { data, error } = await municipioService.getEstadisticas(municipioId);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      toast.error('Error al cargar estadísticas');
      return { data: null, error: err };
    }
  };

  return {
    municipios,
    loading,
    error,
    refetch: fetchMunicipios,
    getMunicipioById,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio,
    getEstadisticas,
  };
};
