import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { MainLayout, AuthLayout, PublicLayout } from '@/components/layout';

// Auth
import { Login, Register, ForgotPassword, ResetPassword } from '@/pages/auth';

// Admin
import { Usuarios, Municipios, FuentesEnergia, Configuracion } from '@/pages/admin';

// Dashboard
import { Dashboard, Overview, Analytics } from '@/pages/dashboard';

// Consumos
import { ConsumosList, ConsumoDetail, NuevoConsumo } from '@/pages/consumos';

// Predicciones
import { Predicciones, Simulador, HistorialPredicciones } from '@/pages/predicciones';

// Profile
import { Profile, EditProfile } from '@/pages/profile';

// Reportes
import { Reportes, Comparativas, Exportar } from '@/pages/reportes';

// Public
import { PublicDashboard, About } from '@/pages/public';

// 404
import NotFound from '@/pages/NotFound';

// Componente de ruta protegida
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole && !['admin'].includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente de ruta pública (redirect si está autenticado)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <PublicDashboard />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      {/* Rutas de Autenticación */}
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Rutas Protegidas - Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Rutas Protegidas - Consumos */}
      <Route
        path="/consumos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ConsumosList />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consumos/nuevo"
        element={
          <ProtectedRoute requiredRole="gestor">
            <MainLayout>
              <NuevoConsumo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consumos/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ConsumoDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas Protegidas - Predicciones */}
      <Route
        path="/predicciones"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Predicciones />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/predicciones/simulador"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Simulador />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/predicciones/historial"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HistorialPredicciones />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas Protegidas - Reportes */}
      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reportes />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes/comparativas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Comparativas />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes/exportar"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Exportar />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas Protegidas - Perfil */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EditProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas Protegidas - Admin */}
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <Usuarios />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/municipios"
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <Municipios />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fuentes-energia"
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <FuentesEnergia />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout>
              <Configuracion />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
