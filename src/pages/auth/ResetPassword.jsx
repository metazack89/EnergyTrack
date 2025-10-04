import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Zap, AlertCircle, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  // Verificar si hay un token válido
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!token || type !== 'recovery') {
      toast.error('Enlace inválido o expirado');
      navigate('/forgot-password');
    }
  }, [token, type, navigate]);

  // Calcular fortaleza de contraseña
  useEffect(() => {
    if (formData.password) {
      const password = formData.password;
      let score = 0;

      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^a-zA-Z0-9]/.test(password)) score++;

      const strengths = [
        { score: 0, label: 'Muy débil', color: 'bg-red-500' },
        { score: 1, label: 'Débil', color: 'bg-orange-500' },
        { score: 2, label: 'Aceptable', color: 'bg-yellow-500' },
        { score: 3, label: 'Buena', color: 'bg-blue-500' },
        { score: 4, label: 'Fuerte', color: 'bg-green-500' },
        { score: 5, label: 'Muy fuerte', color: 'bg-green-600' },
      ];

      setPasswordStrength(strengths[score] || strengths[0]);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.password]);

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength.score < 2) {
      newErrors.password = 'La contraseña es demasiado débil';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const { error } = await updatePassword(formData.password);

      if (error) {
        toast.error(error.message || 'Error al actualizar la contraseña');
        return;
      }

      setSuccess(true);
      toast.success('Contraseña actualizada exitosamente');

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error inesperado al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">
            {success ? '¡Contraseña actualizada!' : 'Nueva Contraseña'}
          </h1>
          <p className="text-gray-600 mt-2">
            {success
              ? 'Ya puedes iniciar sesión con tu nueva contraseña'
              : 'Ingresa tu nueva contraseña segura'}
          </p>
        </div>

        {/* Contenido */}
        <Card className="p-8 shadow-xl">
          {!success ? (
            // Formulario de nueva contraseña
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requisitos de contraseña */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tu contraseña debe tener:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Al menos 8 caracteres</li>
                      <li>Letras mayúsculas y minúsculas</li>
                      <li>Al menos un número</li>
                      <li>Al menos un símbolo especial</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Barra de fortaleza */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-2 text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </motion.div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 mt-2 text-green-600 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Las contraseñas coinciden</span>
                  </motion.div>
                )}

                {errors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-2 text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Actualizar Contraseña
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Mensaje de éxito
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <p className="text-gray-700 mb-2">
                  Tu contraseña ha sido actualizada exitosamente.
                </p>
                <p className="text-sm text-gray-500">
                  Serás redirigido al login en unos segundos...
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Consejo de seguridad:</strong> No compartas tu contraseña y usa una
                  diferente para cada servicio.
                </p>
              </div>

              <Button onClick={() => navigate('/login')} className="w-full">
                Ir al Login Ahora
              </Button>
            </motion.div>
          )}

          {/* Link al login */}
          {!success && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Volver al Login
                </Link>
              </div>
            </>
          )}
        </Card>

        {/* Ayuda adicional */}
        {!success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              ¿Problemas con el enlace?{' '}
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Solicitar uno nuevo
              </Link>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
