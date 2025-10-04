import { Component } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary para capturar errores de React
 * Muestra UI de fallback cuando ocurre un error en componentes hijos
 *
 * @class ErrorBoundary
 * @extends Component
 * @example
 * <ErrorBoundary>
 *   <MiComponente />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Método estático para actualizar estado cuando ocurre error
   * Se ejecuta durante la fase de renderizado
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Método del ciclo de vida para capturar errores
   * Se ejecuta después de que un error es lanzado
   */
  componentDidCatch(error, errorInfo) {
    // Actualizar estado con información del error
    this.setState({
      error,
      errorInfo,
    });

    // Log del error (puede enviarse a servicio de monitoreo)
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    // Aquí puedes enviar el error a un servicio como Sentry
    // logErrorToService(error, errorInfo)
  }

  /**
   * Resetear el error y reintentar renderizar
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Recargar la página completamente
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Navegar al inicio
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    // Si hay error, mostrar UI de fallback
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            {/* Icono de error */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Título y descripción */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al
              inicio.
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg overflow-auto max-h-64">
                <p className="text-sm font-semibold text-gray-900 mb-2">Error Details:</p>
                <pre className="text-xs text-red-600">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-600 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Ir al Inicio
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button onClick={this.handleReload}>Recargar Página</Button>
            </div>
          </Card>
        </div>
      );
    }

    // Si no hay error, renderizar hijos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
