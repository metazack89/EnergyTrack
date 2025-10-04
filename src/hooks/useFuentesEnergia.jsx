import { useState, useEffect } from 'react';
import { fuenteService } from '@/services/supabase/fuente.service';
import toast from 'react-hot-toast';

export const useFuentesEnergia = (filters = {}) => {
  const [fuentes, setFuentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFuentes();
  }, [filters.municipioId, filters.tipo, filters.estado]);

  const fetchFuentes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await fuenteService.getFuentes(filters);

      if (error) throw error;

      setFuentes(data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar fuentes de energía');
    } finally {
      setLoading(false);
    }
  };

  const getFuenteById = async (id) => {
    try {
      const { data, error } = await fuenteService.getFuenteById(id);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      toast.error('Error al cargar fuente');
      return { data: null, error: err };
    }
  };

  const createFuente = async (fuenteData) => {
    try {
      setLoading(true);
      const { data, error } = await fuenteService.createFuente(fuenteData);

      if (error) throw error;

      setFuentes((prev) => [...prev, data]);
      toast.success('Fuente de energía creada exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al crear fuente de energía');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateFuente = async (id, updates) => {
    try {
      setLoading(true);
      const { data, error } = await fuenteService.updateFuente(id, updates);

      if (error) throw error;

      setFuentes((prev) => prev.map((f) => (f.id === id ? data : f)));
      toast.success('Fuente actualizada exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al actualizar fuente');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteFuente = async (id) => {
    try {
      setLoading(true);
      const { error } = await fuenteService.deleteFuente(id);

      if (error) throw error;

      setFuentes((prev) => prev.filter((f) => f.id !== id));
      toast.success('Fuente eliminada exitosamente');

      return { error: null };
    } catch (err) {
      toast.error('Error al eliminar fuente');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const { data, error } = await fuenteService.cambiarEstado(id, nuevoEstado);

      if (error) throw error;

      setFuentes((prev) => prev.map((f) => (f.id === id ? data : f)));
      toast.success(`Estado cambiado a ${nuevoEstado}`);

      return { data, error: null };
    } catch (err) {
      toast.error('Error al cambiar estado');
      return { data: null, error: err };
    }
  };

  const getCapacidadPorTipo = async (municipioId = null) => {
    try {
      const { data, error } = await fuenteService.getCapacidadPorTipo(municipioId);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      toast.error('Error al cargar capacidad');
      return { data: null, error: err };
    }
  };

  return {
    fuentes,
    loading,
    error,
    refetch: fetchFuentes,
    getFuenteById,
    createFuente,
    updateFuente,
    deleteFuente,
    cambiarEstado,
    getCapacidadPorTipo,
  };
};
