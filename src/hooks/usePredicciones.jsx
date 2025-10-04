import { useState, useEffect } from 'react';
import { prediccionService } from '@/services/supabase/prediccion.service';
import { predictorService } from '@/services/ml/predictor';
import toast from 'react-hot-toast';

export const usePredicciones = (municipioId, fuenteId = null) => {
  const [predicciones, setPredicciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (municipioId) {
      fetchPredicciones();
    }
  }, [municipioId, fuenteId]);

  const fetchPredicciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = { municipioId };
      if (fuenteId) filters.fuenteId = fuenteId;

      const { data, error } = await prediccionService.getPredicciones(filters);

      if (error) throw error;

      setPredicciones(data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar predicciones');
    } finally {
      setLoading(false);
    }
  };

  const generarPredicciones = async (mesesFuturos = 6) => {
    try {
      setLoading(true);
      const { data, error } = await prediccionService.generarPredicciones(
        municipioId,
        mesesFuturos
      );

      if (error) throw error;

      setPredicciones(data || []);
      toast.success('Predicciones generadas exitosamente');

      return { data, error: null };
    } catch (err) {
      toast.error('Error al generar predicciones');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const simularEscenario = async (reduccionPorcentaje) => {
    try {
      setLoading(true);
      const { data, error } = await prediccionService.simularEscenario(
        municipioId,
        reduccionPorcentaje
      );

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      toast.error('Error al simular escenario');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const predecirLocal = (historico, periodos = 6) => {
    try {
      return predictorService.predecirConsumo(historico, periodos);
    } catch (err) {
      toast.error('Error en predicción local');
      return [];
    }
  };

  const predecirConEstacionalidad = (historico, periodos = 6) => {
    try {
      return predictorService.predecirConEstacionalidad(historico, periodos);
    } catch (err) {
      toast.error('Error en predicción con estacionalidad');
      return [];
    }
  };

  return {
    predicciones,
    loading,
    error,
    refetch: fetchPredicciones,
    generarPredicciones,
    simularEscenario,
    predecirLocal,
    predecirConEstacionalidad,
  };
};
