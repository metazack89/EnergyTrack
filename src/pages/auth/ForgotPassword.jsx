import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Zap, AlertCircle, Loader2, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const { error } = await resetPassword(email);

      if (error) {
        toast.error(error.message || 'Error al enviar el email');
        return;
      }

      setEmailSent(true);
      toast.success('Email enviado exitosamente');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Error inesperado al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await handleSubmit({ preventDefault: () => {} });
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
            {emailSent ? '¡Email enviado!' : '¿Olvidaste tu contraseña?'}
          </h1>
          <p className="text-gray-600 mt-2">
            {emailSent
              ? 'Revisa tu bandeja de entrada'
              : 'Te enviaremos instrucciones para recuperarla'}
          </p>
        </div>

        {/* Contenido */}
        <Card className="p-8 shadow-xl">
          {!emailSent ? (
            // Formulario para solicitar email
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="tu@email.com"
                    className={`pl-10 ${error ? 'border-red-500' : ''}`}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-2 text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Ingresa el email asociado a tu cuenta y te enviaremos un enlace para restablecer
                  tu contraseña.
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Instrucciones
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
                <p className="text-gray-700 mb-2">Hemos enviado un email a:</p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El enlace expirará en 1 hora. Si no recibes el email,
                  revisa tu carpeta de spam.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Reenviar Email
                    </>
                  )}
                </Button>

                <Button onClick={() => navigate('/login')} variant="default" className="w-full">
                  Volver al Login
                </Button>
              </div>
            </motion.div>
          )}

          {/* Back to login */}
          {!emailSent && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/login">
                  <Button type="button" variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>

        {/* Ayuda adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@energyplatform.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contacta a soporte
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
