export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'EnergiaPlatform',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  version: '1.0.0',
  description: 'Plataforma de gestión y predicción del consumo energético',

  features: {
    mlPredictions: import.meta.env.VITE_ENABLE_ML_PREDICTIONS === 'true',
    publicDashboard: import.meta.env.VITE_ENABLE_PUBLIC_DASHBOARD === 'true',
  },

  departamentos: {
    SANTANDER: 'Santander',
    NORTE_SANTANDER: 'Norte de Santander',
  },

  roles: {
    ADMIN: 'admin',
    GESTOR: 'gestor',
    VIEWER: 'viewer',
  },

  tiposFuente: {
    ELECTRICA: 'electrica',
    SOLAR: 'solar',
    EOLICA: 'eolica',
    HIDROELECTRICA: 'hidroelectrica',
    BIOMASA: 'biomasa',
  },

  tiposConsumo: {
    RESIDENCIAL: 'residencial',
    COMERCIAL: 'comercial',
    INDUSTRIAL: 'industrial',
    PUBLICO: 'publico',
  },

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
  },
};
