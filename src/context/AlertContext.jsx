import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/config/supabase.config';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AlertContext = createContext({});

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts debe usarse dentro de AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const { profile } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [alertasActivas, setAlertasActivas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchAlertas();
      subscribeToAlertas();
    }
  }, [profile]);

  const fetchAlertas = async () => {
    try {
      setLoading(true);

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
        .order('created_at', { ascending: false })
        .limit(50);

      // Filtrar por departamento si el usuario no es admin
      if (profile?.departamento_id && profile?.role !== 'admin') {
        query = query.eq('municipios.departamento_id', profile.departamento_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAlertas(data || []);
      setAlertasActivas(data?.filter((a) => !a.leida) || []);
    } catch (error) {
      console.error('Error fetching alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlertas = () => {
    const subscription = supabase
      .channel('alertas_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas',
        },
        (payload) => {
          const newAlerta = payload.new;
          setAlertas((prev) => [newAlerta, ...prev]);
          setAlertasActivas((prev) => [newAlerta, ...prev]);

          // Mostrar notificación toast
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getSeverityIcon(newAlerta.severidad)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {newAlerta.tipo.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {newAlerta.mensaje}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      marcarComoLeida(newAlerta.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    Marcar leída
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
            }
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const marcarComoLeida = async (alertaId) => {
    try {
      const { error } = await supabase.from('alertas').update({ leida: true }).eq('id', alertaId);

      if (error) throw error;

      setAlertas((prev) => prev.map((a) => (a.id === alertaId ? { ...a, leida: true } : a)));
      setAlertasActivas((prev) => prev.filter((a) => a.id !== alertaId));
    } catch (error) {
      console.error('Error marking alerta as read:', error);
      toast.error('Error al marcar alerta como leída');
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const ids = alertasActivas.map((a) => a.id);

      const { error } = await supabase.from('alertas').update({ leida: true }).in('id', ids);

      if (error) throw error;

      setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
      setAlertasActivas([]);
      toast.success('Todas las alertas marcadas como leídas');
    } catch (error) {
      console.error('Error marking all alertas as read:', error);
      toast.error('Error al marcar alertas como leídas');
    }
  };

  const crearAlerta = async (alertaData) => {
    try {
      const { data, error } = await supabase.from('alertas').insert([alertaData]).select().single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating alerta:', error);
      return { data: null, error };
    }
  };

  const getSeverityIcon = (severidad) => {
    const icons = {
      baja: '💡',
      media: '⚠️',
      alta: '🔴',
      critica: '🚨',
    };
    return icons[severidad] || '📢';
  };

  const value = {
    alertas,
    alertasActivas,
    loading,
    cantidadActivas: alertasActivas.length,
    fetchAlertas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    crearAlerta,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};
