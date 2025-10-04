export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',

  energy: {
    electrica: '#f59e0b',
    solar: '#fbbf24',
    eolica: '#06b6d4',
    hidroelectrica: '#3b82f6',
    biomasa: '#10b981',
  },

  gradient: {
    primary: ['#3b82f6', '#8b5cf6'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
  },
};

export const CHART_CONFIG = {
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
    },
    cursor: { fill: 'rgba(59, 130, 246, 0.1)' },
  },

  legend: {
    iconType: 'circle',
    wrapperStyle: {
      paddingTop: '20px',
    },
  },

  grid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
  },

  cartesianGrid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
  },

  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
};

export const CHART_FORMATS = {
  number: (value) => new Intl.NumberFormat('es-CO').format(value),
  currency: (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value),
  percent: (value) => `${value}%`,
  kwh: (value) => `${new Intl.NumberFormat('es-CO').format(value)} kWh`,
};
