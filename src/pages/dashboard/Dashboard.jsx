import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/card';
import { LayoutDashboard, BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const tabs = [
    {
      name: 'Vista General',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Resumen y estadísticas principales',
    },
    {
      name: 'Análisis',
      path: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Análisis detallado y tendencias',
    },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <span>Panel de Control</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">
                  {tabs.find((tab) => isActive(tab.path))?.name || 'Dashboard'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);

              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`
                    relative flex items-center gap-2 px-4 py-4 border-b-2 transition-colors
                    ${
                      active
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="font-medium">{tab.name}</span>
                    {active && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-500 hidden sm:block"
                      >
                        {tab.description}
                      </motion.span>
                    )}
                  </div>

                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido del dashboard */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
