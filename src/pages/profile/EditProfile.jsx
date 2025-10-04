import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Camera,
  Shield,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    telefono: '',
    departamento: '',
    cargo: '',
    organizacion: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        telefono: profile.telefono || '',
        departamento: profile.departamento || '',
        cargo: profile.cargo || '',
        organizacion: profile.organizacion || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordStrength(calculatePasswordStrength(passwordData.newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [passwordData.newPassword]);

  const departamentos = [
    'Santander',
    'Antioquia',
    'Cundinamarca',
    'Valle del Cauca',
    'Atlántico',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Cauca',
    'Cesar',
    'Córdoba',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Quindío',
    'Risaralda',
    'Sucre',
    'Tolima',
    'Otro',
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
    ];
    return { label: labels[strength] || labels[0], color: colors[strength] || colors[0] };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefono && !/^\d{7,10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono debe tener 7-10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Ingresa tu contraseña actual';
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (passwordStrength < 2) {
      newErrors.newPassword = 'La contraseña es muy débil. Usa mayúsculas, números y símbolos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await updateProfile(formData);
      toast.success('Perfil actualizado exitosamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setLoading(true);
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('info');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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

  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Perfil
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="w-8 h-8 text-primary-600" />
          Editar Perfil
        </h1>
        <p className="text-gray-600 mt-2">
          Actualiza tu información personal y configuración de seguridad
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'info', label: 'Información Personal', icon: User },
          { id: 'password', label: 'Cambiar Contraseña', icon: Lock },
          { id: 'security', label: 'Seguridad', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Información Personal */}
      {activeTab === 'info' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="text-center pb-6 border-b">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-primary-500 hover:bg-primary-50 transition-colors"
                    onClick={() => toast.info('Funcionalidad de foto próximamente')}
                  >
                    <Camera className="w-4 h-4 text-primary-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Haz clic para cambiar tu foto de perfil
                </p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">
                  {profile.role === 'admin'
                    ? 'Administrador'
                    : profile.role === 'gestor'
                    ? 'Gestor'
                    : 'Usuario'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre Completo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Juan Pérez García"
                      className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.full_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="3001234567"
                      className={`pl-10 ${errors.telefono ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.telefono && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telefono}
                    </p>
                  )}
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      className="pl-10"
                    >
                      <option value="">Seleccionar...</option>
                      {departamentos.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                  <Input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    placeholder="Analista de Energía"
                  />
                </div>

                {/* Organización */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organización
                  </label>
                  <Input
                    type="text"
                    name="organizacion"
                    value={formData.organizacion}
                    onChange={handleChange}
                    placeholder="Empresa o institución"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Cambiar Contraseña */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>
                    Por seguridad, necesitas ingresar tu contraseña actual para poder cambiarla.
                  </span>
                </p>
              </div>

              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}

                {/* Indicador de fortaleza */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Fortaleza:</span>
                      <span className="text-xs font-medium">{strengthInfo.label}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Recomendaciones */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Recomendaciones de Seguridad:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    Mínimo 8 caracteres
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        /[A-Z]/.test(passwordData.newPassword) &&
                        /[a-z]/.test(passwordData.newPassword)
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    Mayúsculas y minúsculas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        /\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    Al menos un número
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        /[^a-zA-Z0-9]/.test(passwordData.newPassword)
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    Símbolos especiales (!@#$%^&*)
                  </li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setActiveTab('info')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Seguridad */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Configuración de Seguridad
            </h3>

            <div className="space-y-6">
              {/* Sesiones activas */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Sesión Actual</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Dispositivo: Navegador Web</p>
                  <p>Ubicación: {profile.departamento || 'No especificada'}</p>
                  <p>Última actividad: Ahora</p>
                </div>
              </div>

              {/* Verificación en dos pasos */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Verificación en dos pasos</h4>
                  <p className="text-sm text-gray-600 mt-1">Añade una capa extra de seguridad</p>
                </div>
                <Button variant="outline" onClick={() => toast.info('Próximamente')}>
                  Activar
                </Button>
              </div>

              {/* Historial de acceso */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Actividad Reciente</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Inicio de sesión exitoso</span>
                    <span className="text-gray-500">Hoy, 10:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Perfil actualizado</span>
                    <span className="text-gray-500">Ayer, 3:15 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default EditProfile;
