import { Link } from 'react-router-dom';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Consumos', path: '/consumos' },
      { label: 'Predicciones', path: '/predicciones' },
      { label: 'Reportes', path: '/reportes' },
    ],
    company: [
      { label: 'Acerca de', path: '/about' },
      { label: 'Contacto', path: '#' },
      { label: 'Blog', path: '#' },
      { label: 'Carreras', path: '#' },
    ],
    legal: [
      { label: 'Privacidad', path: '#' },
      { label: 'Términos', path: '#' },
      { label: 'Cookies', path: '#' },
      { label: 'Licencias', path: '#' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">EnergyTrack</h3>
            <p className="text-sm text-gray-600 mb-4">
              Plataforma de monitoreo y análisis de consumo energético para Santander
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5 text-gray-600" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-600" />
              </a>
              <a
                href="mailto:contacto@energytrack.co"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Producto</h4>
            <ul className="space-y-2">
              {links.product.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Compañía</h4>
            <ul className="space-y-2">
              {links.company.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-red-500 fill-current" /> en Colombia
            <span className="mx-2">•</span>© {currentYear} EnergyTrack. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
