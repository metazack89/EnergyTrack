import {
  LayoutDashboard,
  BarChart3,
  Brain,
  FileText,
  Users,
  Settings,
  MapPin,
  Zap,
  User,
  Home,
  Info,
} from 'lucide-react';

// Configuración de rutas con metadata
export const routeConfig = {
  // Rutas públicas
  public: [
    {
      path: '/',
      name: 'Dashboard Público',
      icon: Home,
      description: 'Vista pública del dashboard',
      layout: 'public',
    },
    {
      path: '/about',
      name: 'Acerca de',
      icon: Info,
      description: 'Información de la plataforma',
      layout: 'public',
    },
  ],

  // Rutas de autenticación
  auth: [
    {
      path: '/auth/login',
      name: 'Iniciar Sesión',
      description: 'Página de inicio de sesión',
      layout: 'auth',
    },
    {
      path: '/auth/register',
      name: 'Registro',
      description: 'Crear nueva cuenta',
      layout: 'auth',
    },
    {
      path: '/auth/forgot-password',
      name: 'Recuperar Contraseña',
      description: 'Recuperación de contraseña',
      layout: 'auth',
    },
    {
      path: '/auth/reset-password',
      name: 'Restablecer Contraseña',
      description: 'Establecer nueva contraseña',
      layout: 'auth',
    },
  ],

  // Rutas principales (sidebar)
  main: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Panel principal',
      roles: ['admin', 'gestor', 'analista', 'viewer'],
      children: [
        {
          path: '/dashboard',
          name: 'Overview',
          description: 'Vista general',
        },
        {
          path: '/dashboard/analytics',
          name: 'Analytics',
          description: 'Análisis detallado',
        },
      ],
    },
    {
      path: '/consumos',
      name: 'Consumos',
      icon: Zap,
      description: 'Gestión de consumos',
      roles: ['admin', 'gestor', 'analista', 'viewer'],
      children: [
        {
          path: '/consumos',
          name: 'Lista',
          description: 'Ver todos los consumos',
        },
        {
          path: '/consumos/nuevo',
          name: 'Nuevo',
          description: 'Crear nuevo consumo',
          roles: ['admin', 'gestor'],
        },
      ],
    },
    {
      path: '/predicciones',
      name: 'Predicciones',
      icon: Brain,
      description: 'Predicciones ML',
      roles: ['admin', 'gestor', 'analista', 'viewer'],
      children: [
        {
          path: '/predicciones',
          name: 'Predicciones',
          description: 'Ver predicciones',
        },
        {
          path: '/predicciones/simulador',
          name: 'Simulador',
          description: 'Simular escenarios',
        },
        {
          path: '/predicciones/historial',
          name: 'Historial',
          description: 'Ver historial',
        },
      ],
    },
    {
      path: '/reportes',
      name: 'Reportes',
      icon: FileText,
      description: 'Generación de reportes',
      roles: ['admin', 'gestor', 'analista'],
      children: [
        {
          path: '/reportes',
          name: 'Generar',
          description: 'Crear reportes',
        },
        {
          path: '/reportes/comparativas',
          name: 'Comparativas',
          description: 'Comparar municipios',
        },
        {
          path: '/reportes/exportar',
          name: 'Exportar',
          description: 'Exportar datos',
        },
      ],
    },
    {
      path: '/admin',
      name: 'Administración',
      icon: Settings,
      description: 'Panel de administración',
      roles: ['admin'],
      children: [
        {
          path: '/admin/usuarios',
          name: 'Usuarios',
          icon: Users,
          description: 'Gestión de usuarios',
        },
        {
          path: '/admin/municipios',
          name: 'Municipios',
          icon: MapPin,
          description: 'Gestión de municipios',
        },
        {
          path: '/admin/fuentes-energia',
          name: 'Fuentes de Energía',
          icon: Zap,
          description: 'Gestión de fuentes',
        },
        {
          path: '/admin/configuracion',
          name: 'Configuración',
          icon: Settings,
          description: 'Configuración del sistema',
        },
      ],
    },
  ],

  // Rutas de perfil (menú usuario)
  profile: [
    {
      path: '/profile',
      name: 'Mi Perfil',
      icon: User,
      description: 'Ver perfil',
    },
    {
      path: '/profile/edit',
      name: 'Editar Perfil',
      description: 'Modificar información',
    },
  ],
};

// Función helper para verificar permisos
export const hasAccess = (route, userRole) => {
  if (!route.roles) return true;
  return route.roles.includes(userRole);
};

// Función helper para obtener breadcrumbs
export const getBreadcrumbs = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Inicio', path: '/' }];

  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({ name, path: currentPath });
  });

  return breadcrumbs;
};

// Función helper para obtener título de página
export const getPageTitle = (pathname) => {
  const allRoutes = [...routeConfig.public, ...routeConfig.main, ...routeConfig.profile];
  const route = allRoutes.find((r) => r.path === pathname);
  return route?.name || 'EnergyTrack';
};

export default routeConfig;
