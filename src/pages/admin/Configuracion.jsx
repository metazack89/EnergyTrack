import { useState, useEffect } from 'react';
import { useAuth, useLocalStorage } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Save,
  Database,
  Bell,
  Mail,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/config/app.config';

const Configuracion = () => {
  const { isAdmin, profile } = useAuth();
  const [saving, setSaving] = useState(false);

  // Configuraciones generales
  const [generalConfig, setGeneralConfig] = useLocalStorage('app_config', {
    appName: APP_CONFIG.name,
    itemsPerPage: 10,
    defaultView: 'grid',
    language: 'es',
  });

  // Configuraciones de notificaciones
  const [notificationConfig, setNotificationConfig] = useLocalStorage('notification_config', {
    emailNotifications: true,
    pushNotifications: false,
    alertasCriticas: true,
    alertasMedias: true,
    alertasBajas: false,
    notificarNuevosUsuarios: true,
  });

  // Configuraciones de visualización
  const [displayConfig, setDisplayConfig] = useLocalStorage('display_config', {
    theme: 'light',
    compactMode: false,
    showAnimations: true,
    chartType: 'line',
  });

  // Configuraciones de seguridad
  const [securityConfig, setSecurityConfig] = useLocalStorage('security_config', {
    sessionTimeout: 60,
    requireStrongPassword: true,
    twoFactorAuth: false,
    logUserActivity: true,
  });

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      // Aquí guardarías las configuraciones en la base de datos
      // Por ahora solo usamos localStorage

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleExportConfig = () => {
    const config = {
      general: generalConfig,
      notifications: notificationConfig,
      display: displayConfig,
      security: securityConfig,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'energy-platform-config.json';
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Configuración exportada');
  };

  const handleImportConfig = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result);

        if (config.general) setGeneralConfig(config.general);
        if (config.notifications) setNotificationConfig(config.notifications);
        if (config.display) setDisplayConfig(config.display);
        if (config.security) setSecurityConfig(config.security);

        toast.success('Configuración importada');
      } catch (error) {
        toast.error('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfig = () => {
    if (confirm('¿Estás seguro de que deseas restablecer toda la configuración?')) {
      setGeneralConfig({
        appName: APP_CONFIG.name,
        itemsPerPage: 10,
        defaultView: 'grid',
        language: 'es',
      });
      setNotificationConfig({
        emailNotifications: true,
        pushNotifications: false,
        alertasCriticas: true,
        alertasMedias: true,
        alertasBajas: false,
        notificarNuevosUsuarios: true,
      });
      setDisplayConfig({
        theme: 'light',
        compactMode: false,
        showAnimations: true,
        chartType: 'line',
      });
      setSecurityConfig({
        sessionTimeout: 60,
        requireStrongPassword: true,
        twoFactorAuth: false,
        logUserActivity: true,
      });

      toast.success('Configuración restablecida');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la configuración</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary-600" />
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 mt-2">
              Personaliza y ajusta la configuración de la plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportConfig}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <label>
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
              <Button
                variant="outline"
                as="span"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Importar
              </Button>
            </label>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <nav className="space-y-2">
              <a
                href="#general"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Database className="w-5 h-5 text-primary-600" />
                <span className="font-medium">General</span>
              </a>
              <a
                href="#notifications"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Notificaciones</span>
              </a>
              <a
                href="#display"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Palette className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Visualización</span>
              </a>
              <a
                href="#security"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Seguridad</span>
              </a>
              <a
                href="#backup"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Database className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Respaldo</span>
              </a>
            </nav>

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleResetConfig}
              >
                <RefreshCw className="w-4 h-4" />
                Restablecer Todo
              </Button>
            </div>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuración General */}
          <motion.div
            id="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Configuración General</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de la Aplicación</label>
                  <Input
                    type="text"
                    value={generalConfig.appName}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        appName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Elementos por página</label>
                  <Select
                    value={generalConfig.itemsPerPage}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        itemsPerPage: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vista predeterminada</label>
                  <Select
                    value={generalConfig.defaultView}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        defaultView: e.target.value,
                      })
                    }
                  >
                    <option value="grid">Cuadrícula</option>
                    <option value="list">Lista</option>
                    <option value="table">Tabla</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Idioma</label>
                  <Select
                    value={generalConfig.language}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        language: e.target.value,
                      })
                    }
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Configuración de Notificaciones */}
          <motion.div
            id="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Notificaciones</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Notificaciones por email</p>
                      <p className="text-sm text-gray-600">
                        Recibir alertas por correo electrónico
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationConfig.emailNotifications}
                    onChange={(checked) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Notificaciones push</p>
                      <p className="text-sm text-gray-600">Notificaciones en el navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationConfig.pushNotifications}
                    onChange={(checked) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Tipos de alertas</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Alertas críticas</span>
                      </div>
                      <Switch
                        checked={notificationConfig.alertasCriticas}
                        onChange={(checked) =>
                          setNotificationConfig({
                            ...notificationConfig,
                            alertasCriticas: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Alertas medias</span>
                      </div>
                      <Switch
                        checked={notificationConfig.alertasMedias}
                        onChange={(checked) =>
                          setNotificationConfig({
                            ...notificationConfig,
                            alertasMedias: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Alertas bajas</span>
                      </div>
                      <Switch
                        checked={notificationConfig.alertasBajas}
                        onChange={(checked) =>
                          setNotificationConfig({
                            ...notificationConfig,
                            alertasBajas: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Notificar nuevos usuarios</p>
                    <p className="text-sm text-gray-600">
                      Alertar cuando se registre un usuario nuevo
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.notificarNuevosUsuarios}
                    onChange={(checked) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        notificarNuevosUsuarios: checked,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Configuración de Visualización */}
          <motion.div
            id="display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Visualización</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tema de la aplicación</label>
                  <Select
                    value={displayConfig.theme}
                    onChange={(e) =>
                      setDisplayConfig({
                        ...displayConfig,
                        theme: e.target.value,
                      })
                    }
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="auto">Automático (según sistema)</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de gráfico predeterminado
                  </label>
                  <Select
                    value={displayConfig.chartType}
                    onChange={(e) =>
                      setDisplayConfig({
                        ...displayConfig,
                        chartType: e.target.value,
                      })
                    }
                  >
                    <option value="line">Líneas</option>
                    <option value="bar">Barras</option>
                    <option value="area">Área</option>
                    <option value="pie">Circular</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Modo compacto</p>
                    <p className="text-sm text-gray-600">Reduce espacios y padding</p>
                  </div>
                  <Switch
                    checked={displayConfig.compactMode}
                    onChange={(checked) =>
                      setDisplayConfig({
                        ...displayConfig,
                        compactMode: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mostrar animaciones</p>
                    <p className="text-sm text-gray-600">Animaciones y transiciones suaves</p>
                  </div>
                  <Switch
                    checked={displayConfig.showAnimations}
                    onChange={(checked) =>
                      setDisplayConfig({
                        ...displayConfig,
                        showAnimations: checked,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Configuración de Seguridad */}
          <motion.div
            id="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Seguridad</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tiempo de sesión (minutos)
                  </label>
                  <Input
                    type="number"
                    value={securityConfig.sessionTimeout}
                    onChange={(e) =>
                      setSecurityConfig({
                        ...securityConfig,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                    min="5"
                    max="480"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La sesión se cerrará automáticamente después de este tiempo de inactividad
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Requerir contraseña segura</p>
                    <p className="text-sm text-gray-600">
                      Mínimo 8 caracteres, mayúsculas, números y símbolos
                    </p>
                  </div>
                  <Switch
                    checked={securityConfig.requireStrongPassword}
                    onChange={(checked) =>
                      setSecurityConfig({
                        ...securityConfig,
                        requireStrongPassword: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Autenticación de dos factores</p>
                      <p className="text-sm text-gray-600">
                        Seguridad adicional con código de verificación
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={securityConfig.twoFactorAuth}
                    onChange={(checked) =>
                      setSecurityConfig({
                        ...securityConfig,
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Registrar actividad de usuarios</p>
                    <p className="text-sm text-gray-600">Guardar logs de acciones importantes</p>
                  </div>
                  <Switch
                    checked={securityConfig.logUserActivity}
                    onChange={(checked) =>
                      setSecurityConfig({
                        ...securityConfig,
                        logUserActivity: checked,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Respaldo y Mantenimiento */}
          <motion.div
            id="backup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Respaldo y Mantenimiento</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Estado del sistema</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Todos los servicios operando normalmente
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Última verificación: {new Date().toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Download className="w-6 h-6" />
                    <span className="text-sm font-medium">Exportar Datos</span>
                    <span className="text-xs text-gray-500">Descargar base de datos</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Importar Datos</span>
                    <span className="text-xs text-gray-500">Restaurar respaldo</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <RefreshCw className="w-6 h-6" />
                    <span className="text-sm font-medium">Limpiar Caché</span>
                    <span className="text-xs text-gray-500">Liberar espacio</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Database className="w-6 h-6" />
                    <span className="text-sm font-medium">Optimizar DB</span>
                    <span className="text-xs text-gray-500">Mejorar rendimiento</span>
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Información del sistema</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Versión de la aplicación:</dt>
                      <dd className="font-medium">{APP_CONFIG.version}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Base de datos:</dt>
                      <dd className="font-medium">PostgreSQL 15</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Tamaño de BD:</dt>
                      <dd className="font-medium">128 MB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Última actualización:</dt>
                      <dd className="font-medium">{new Date().toLocaleDateString('es-CO')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Botón de guardar fijo */}
          <div className="sticky bottom-4 z-10">
            <Card className="p-4 bg-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Los cambios se guardan automáticamente</span>
                </div>
                <Button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
