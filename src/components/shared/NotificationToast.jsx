import { Toaster } from 'react-hot-toast';

/**
 * Configuración global de notificaciones toast
 * Wrapper para react-hot-toast con estilos personalizados
 *
 * @example
 * // En App.jsx o layout principal
 * <NotificationToast />
 *
 * // Para usar en componentes:
 * import toast from 'react-hot-toast'
 * toast.success('¡Operación exitosa!')
 * toast.error('Ocurrió un error')
 */
const NotificationToast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Duración por defecto
        duration: 4000,

        // Estilos base
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },

        // Toast de éxito
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },

        // Toast de error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },

        // Toast de carga
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default NotificationToast;
