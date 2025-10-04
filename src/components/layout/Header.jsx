import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/dashboard';
import { useAuth } from '@/hooks';
import { User, LogOut, Settings, ChevronDown, Menu, X, Zap, HelpCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {Object} HeaderProps
 * @property {Function} [onToggleSidebar] - Callback para toggle del sidebar
 * @property {boolean} [sidebarOpen] - Estado del sidebar
 */

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'info',
      title: 'Nuevo consumo registrado',
      message: 'Se ha registrado el consumo de Enero 2025',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Consumo elevado',
      message: 'El consumo de Bucaramanga superó el promedio',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', class: 'bg-purple-100 text-purple-800' },
      gestor: { label: 'Gestor', class: 'bg-blue-100 text-blue-800' },
      analista: { label: 'Analista', class: 'bg-green-100 text-green-800' },
      viewer: { label: 'Visor', class: 'bg-gray-100 text-gray-800' },
    };
    return badges[role] || badges.viewer;
  };

  const roleBadge = getRoleBadge(profile?.role);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">EnergyTrack</h1>
              <p className="text-xs text-gray-500">Santander</p>
            </div>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Help button */}
          <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
          />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>

              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.full_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
                      <Badge className={`${roleBadge.class} mt-2`} size="sm">
                        {roleBadge.label}
                      </Badge>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </Link>

                      <Link
                        to="/profile/edit"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>

                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin/configuracion"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
