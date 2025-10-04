import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  Shield,
  ArrowLeft,
  Mail,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  Brain,
  Leaf,
} from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const caracteristicas = [
    {
      icon: BarChart3,
      title: 'Análisis en Tiempo Real',
      desc: 'Monitoreo continuo del consumo energético',
    },
    { icon: Brain, title: 'Predicciones ML', desc: 'Proyecciones basadas en Machine Learning' },
    { icon: Target, title: 'Reportes Detallados', desc: 'Informes personalizables y exportables' },
    { icon: Leaf, title: 'Impacto Ambiental', desc: 'Cálculo de huella de carbono' },
    { icon: Users, title: 'Multi-usuario', desc: 'Gestión de roles y permisos' },
    { icon: Shield, title: 'Seguridad', desc: 'Datos encriptados y protegidos' },
  ];

  const tecnologias = [
    { name: 'React 18', category: 'Frontend' },
    { name: 'Supabase', category: 'Backend' },
    { name: 'TailwindCSS', category: 'Estilos' },
    { name: 'Recharts', category: 'Gráficos' },
    { name: 'Machine Learning', category: 'IA' },
    { name: 'PostgreSQL', category: 'Base de Datos' },
  ];

  const equipo = [
    { nombre: 'Desarrollo', rol: 'Full Stack', icono: Github },
    { nombre: 'Análisis de Datos', rol: 'Data Science', icono: BarChart3 },
    { nombre: 'Diseño UX/UI', rol: 'Product Design', icono: Lightbulb },
  ];

  const estadisticas = [
    { valor: '92', label: 'Municipios', icon: Target },
    { valor: '4', label: 'Fuentes de Energía', icon: Zap },
    { valor: '1,234', label: 'Usuarios Activos', icon: Users },
    { valor: '99.9%', label: 'Uptime', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">EnergyTrack Colombia</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma integral para el monitoreo, análisis y optimización del consumo energético en
            los municipios de Santander
          </p>
        </motion.div>

        {/* Misión y Visión */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed">
                Proporcionar herramientas de análisis energético accesibles y precisas que permitan
                a gobiernos locales, empresas y ciudadanos tomar decisiones informadas para un
                futuro más sostenible.
              </p>
            </Card>

            <Card className="p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser la plataforma líder en Colombia para la gestión inteligente de energía,
                contribuyendo significativamente a la reducción de la huella de carbono y
                promoviendo la transición energética.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {estadisticas.map((stat, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <p className="text-3xl font-bold text-gray-900">{stat.valor}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Características Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caracteristicas.map((feat, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feat.title}</h4>
                    <p className="text-sm text-gray-600">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tecnologías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Stack Tecnológico</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {tecnologias.map((tech, i) => (
                <Badge key={i} variant="outline" className="px-4 py-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  {tech.name}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nuestro Equipo</h3>
            <p className="text-gray-600">
              Profesionales comprometidos con la innovación energética
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {equipo.map((miembro, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <miembro.icono className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{miembro.nombre}</h4>
                <p className="text-sm text-gray-600">{miembro.rol}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Contacto y Redes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8 bg-gradient-to-r from-primary-500 to-purple-600 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h3>
            <p className="text-blue-100 mb-6">Estamos aquí para ayudarte</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="bg-white text-primary-600 hover:bg-blue-50">
                <Mail className="w-4 h-4 mr-2" />
                contacto@energytrack.co
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                <Globe className="w-4 h-4 mr-2" />
                www.energytrack.co
              </Button>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600 mb-4">
            © 2025 EnergyTrack Colombia. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-primary-600">
              Términos de Uso
            </a>
            <a href="#" className="hover:text-primary-600">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-primary-600">
              Documentación
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
