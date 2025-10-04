import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks';
import { routeConfig, hasAccess } from '@/routes/routeConfig';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {Object} SidebarProps
 * @property {boolean} [isOpen] - Estado del sidebar
 * @property {Function} [onClose] - Callback para cerrar (móvil)
 */

const Sidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (path) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isChildActive = (children) => {
    return children?.some((child) => isActive(child.path));
  };

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer click
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <nav className="space-y-1">
              {routeConfig.main.map((route) => {
                // Verificar permisos
                if (!hasAccess(route, profile?.role)) {
                  return null;
                }

                const Icon = route.icon;
                const active = isActive(route.path);
                const hasChildren = route.children && route.children.length > 0;
                const isExpanded = expandedMenus[route.path];
                const childActive = isChildActive(route.children);

                return (
                  <div key={route.path}>
                    {hasChildren ? (
                      // Menu with children
                      <>
                        <button
                          onClick={() => toggleMenu(route.path)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            active || childActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span>{route.name}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {/* Submenu */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                                {route.children.map((child) => {
                                  if (!hasAccess(child, profile?.role)) {
                                    return null;
                                  }

                                  const ChildIcon = child.icon;
                                  const childIsActive = isActive(child.path);

                                  return (
                                    <Link
                                      key={child.path}
                                      to={child.path}
                                      onClick={handleLinkClick}
                                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                        childIsActive
                                          ? 'bg-primary-50 text-primary-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      {ChildIcon && <ChildIcon className="w-4 h-4" />}
                                      <span>{child.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      // Single menu item
                      <Link
                        to={route.path}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          active
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{route.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Sistema Operativo</span>
            </div>
            <p className="text-xs text-gray-500">
              EnergyTrack v1.0.0 <br />© 2025 Todos los derechos reservados
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
