import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, ArrowLeft, Search, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-12 text-center">
          {/* Número 404 */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              404
            </h1>
          </div>

          {/* Icono */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
              <Map className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          {/* Mensaje */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Página No Encontrada</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="w-5 h-5 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver Atrás
            </Button>
          </div>

          {/* Links útiles */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600 mb-4">¿Buscabas algo en particular?</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/consumos', label: 'Consumos' },
                { to: '/predicciones', label: 'Predicciones' },
                { to: '/reportes', label: 'Reportes' },
              ].map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button variant="ghost" size="sm">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@energytrack.co" className="text-primary-600 hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
