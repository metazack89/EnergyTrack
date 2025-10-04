import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import LoadingSpinner from './LoadingSpinner';

/**
 * @typedef {Object} ProtectedRouteProps
 * @property {React.ReactNode} children - Componentes hijos a renderizar
 * @property {string} [requiredRole] - Rol requerido para acceder
 * @property {string} [redirectTo] - Ruta de redirección si no autorizado
 */

/**
 * Componente HOC para proteger rutas que requieren autenticación
 * Valida el usuario y opcionalmente verifica roles
 *
 * @param {ProtectedRouteProps} props - Propiedades del componente
 * @example
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRole, redirectTo = '/auth/login' }) => {
  // Obtener estado de autenticación
  const { user, profile, loading } = useAuth();

  /**
   * Mostrar spinner mientras carga la autenticación
   */
  if (loading) {
    return <LoadingSpinner fullScreen message="Verificando acceso..." />;
  }

  /**
   * Redirigir a login si no hay usuario autenticado
   */
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  /**
   * Verificar rol si es requerido
   * Admin tiene acceso a todo
   */
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          error: 'No tienes permisos para acceder a esta sección',
        }}
      />
    );
  }

  /**
   * Renderizar componente protegido si todas las validaciones pasan
   */
  return children;
};

export default ProtectedRoute;
