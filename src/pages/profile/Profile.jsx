import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useConsumos, usePredicciones } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  LogOut,
  Activity,
  BarChart3,
  Brain,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { consumos } = useConsumos();
  const { predicciones } = usePredicciones();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    consumos: 0,
    reportes: 0,
    predicciones: 0,
    diasActivo: 0,
  });

  useEffect(() => {
    if (profile) {
      calcularEstadisticas();
    }
  }, [profile, consumos, predicciones]);

  const calcularEstadisticas = () => {
    const consumosUsuario = consumos.filter((c) => c.created_by === profile?.id).length;
    const prediccionesUsuario = predicciones.filter((p) => p.user_id === profile?.id).length;

    const fechaRegistro = new Date(profile?.created_at || Date.now());
    const hoy = new Date();
    const diasActivo = Math.floor((hoy - fechaRegistro) / (1000 * 60 * 60 * 24));

    setStats({
      consumos: consumosUsuario,
      reportes: profile?.reportes_count || 0,
      predicciones: prediccionesUsuario,
      diasActivo,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/auth/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-800', icon: Shield },
      gestor: { label: 'Gestor', color: 'bg-blue-100 text-blue-800', icon: Target },
      analista: { label: 'Analista', color: 'bg-green-100 text-green-800', icon: BarChart3 },
      viewer: { label: 'Visor', color: 'bg-gray-100 text-gray-800', icon: User },
    };
    return roles[role] || roles.viewer;
  };

  const getLogros = () => {
    return [
      {
        name: 'Primer Registro',
        desc: 'Creaste tu primer consumo',
        achieved: stats.consumos > 0,
        icon: Activity,
      },
      {
        name: 'Analista',
        desc: '10 reportes generados',
        achieved: stats.reportes >= 10,
        icon: BarChart3,
      },
      {
        name: 'Predictor',
        desc: '5 predicciones calculadas',
        achieved: stats.predicciones >= 5,
        icon: Brain,
      },
      {
        name: 'Experto',
        desc: '50 registros creados',
        achieved: stats.consumos >= 50,
        icon: Award,
      },
      {
        name: 'Comprometido',
        desc: '30 días de uso',
        achieved: stats.diasActivo >= 30,
        icon: Calendar,
      },
      {
        name: 'Veterano',
        desc: '1 año activo',
        achieved: stats.diasActivo >= 365,
        icon: TrendingUp,
      },
    ];
  };

  const getPermisos = () => {
    const role = profile?.role || 'viewer';
    return [
      { label: 'Ver Dashboard', allowed: true },
      { label: 'Gestionar Consumos', allowed: ['admin', 'gestor'].includes(role) },
      { label: 'Ver Predicciones', allowed: true },
      { label: 'Generar Reportes', allowed: ['admin', 'gestor', 'analista'].includes(role) },
      { label: 'Administrar Usuarios', allowed: role === 'admin' },
      { label: 'Configuración Avanzada', allowed: role === 'admin' },
    ];
  };

  const getActividadReciente = () => {
    return [
      {
        action: 'Registro de consumo creado',
        date: formatDate(new Date()),
        icon: Activity,
        color: 'blue',
      },
      {
        action: 'Reporte generado',
        date: formatDate(new Date(Date.now() - 86400000)),
        icon: FileText,
        color: 'green',
      },
      {
        action: 'Predicción calculada',
        date: formatDate(new Date(Date.now() - 172800000)),
        icon: Brain,
        color: 'purple',
      },
      {
        action: 'Perfil actualizado',
        date: formatDate(new Date(Date.now() - 259200000)),
        icon: User,
        color: 'orange',
      },
    ];
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </Card>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);
  const logros = getLogros();
  const permisos = getPermisos();
  const actividades = getActividadReciente();
  const logrosCompletados = logros.filter((l) => l.achieved).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8 text-primary-600" />
              Mi Perfil
            </h1>
            <p className="text-gray-600 mt-2">Información personal y configuración de cuenta</p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile/edit">
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setShowLogoutModal(true)}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.full_name || 'Usuario'}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">{profile.email}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className={roleBadge.color}>
                    <roleBadge.icon className="w-3 h-3 mr-1" />
                    {roleBadge.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-900 truncate">{profile.email}</p>
                  </div>
                </div>

                {profile.telefono && (
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Teléfono</p>
                      <p className="font-medium text-gray-900">{profile.telefono}</p>
                    </div>
                  </div>
                )}

                {profile.departamento && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Ubicación</p>
                      <p className="font-medium text-gray-900">{profile.departamento}</p>
                    </div>
                  </div>
                )}

                {profile.cargo && (
                  <div className="flex items-start gap-3 text-sm">
                    <Target className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Cargo</p>
                      <p className="font-medium text-gray-900">{profile.cargo}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Miembro desde</p>
                    <p className="font-medium text-gray-900">{formatDate(profile.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Última conexión</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(profile.last_sign_in_at || profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Permisos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Permisos
              </h3>
              <div className="space-y-2">
                {permisos.map((perm, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <span className="text-gray-700">{perm.label}</span>
                    {perm.allowed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-gray-400">No disponible</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Estadísticas de Actividad</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Registros', value: stats.consumos, icon: Activity, color: 'blue' },
                  { label: 'Reportes', value: stats.reportes, icon: FileText, color: 'green' },
                  {
                    label: 'Predicciones',
                    value: stats.predicciones,
                    icon: Brain,
                    color: 'purple',
                  },
                  {
                    label: 'Días Activo',
                    value: stats.diasActivo,
                    icon: Calendar,
                    color: 'orange',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200"
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-600`} />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {actividades.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 bg-${activity.color}-50 rounded-lg flex-shrink-0`}>
                      <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Logros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Logros
                </h3>
                <Badge variant="outline">
                  {logrosCompletados}/{logros.length} completados
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {logros.map((logro, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      logro.achieved
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        logro.achieved ? 'bg-yellow-100' : 'bg-gray-200'
                      }`}
                    >
                      <logro.icon
                        className={`w-6 h-6 ${
                          logro.achieved ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{logro.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{logro.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Progreso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-4">Tu Progreso</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">Nivel de Actividad</span>
                    <span className="font-semibold">
                      {Math.min(
                        100,
                        Math.round((stats.consumos + stats.reportes + stats.predicciones) / 3)
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((stats.consumos + stats.reportes + stats.predicciones) / 3)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">Logros Desbloqueados</span>
                    <span className="font-semibold">
                      {Math.round((logrosCompletados / logros.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 transition-all duration-500"
                      style={{ width: `${(logrosCompletados / logros.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal Cerrar Sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cerrar Sesión</h3>
                <p className="text-sm text-gray-600 mt-1">
                  ¿Estás seguro de que deseas cerrar sesión?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
