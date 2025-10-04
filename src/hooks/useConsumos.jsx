import { useState, useEffect } from 'react';
import { consumoService } from '@/services/supabase/consumo.service';
import toast from 'react-hot-toast';

export const useConsumos = (initialFilters = {}) => {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchConsumos();
    }
  }, [filters]);

  const fetchConsumos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await consumoService.getConsumos(filters);

      if (error) throw error;

      setConsumos(data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar consumos');
    } finally {
      setLoading(false);
    }
  };

  const createConsumo = async (consumoData) => {
    try {
      setLoading(true);
      const { data, error } = await consumoService.createConsumo(consumoData);

      if (error) throw error;

      setConsumos((prev) => [data, ...prev]);
      toast.success('Consumo registrado exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al registrar consumo');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateConsumo = async (id, updates) => {
    try {
      setLoading(true);
      const { data, error } = await consumoService.updateConsumo(id, updates);

      if (error) throw error;

      setConsumos((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success('Consumo actualizado exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al actualizar consumo');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteConsumo = async (id) => {
    try {
      setLoading(true);
      const { error } = await consumoService.deleteConsumo(id);

      if (error) throw error;

      setConsumos((prev) => prev.filter((c) => c.id !== id));
      toast.success('Consumo eliminado exitosamente');

      return { error: null };
    } catch (err) {
      toast.error('Error al eliminar consumo');
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const getEstadisticas = () => {
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
  };

  return {
    consumos,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchConsumos,
    createConsumo,
    updateConsumo,
    deleteConsumo,
    getEstadisticas,
  };
};
