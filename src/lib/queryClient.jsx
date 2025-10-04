import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para queries
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Manejo de errores global
      onError: (error) => {
        console.error('Query Error:', error);
      },
    },
    mutations: {
      // Configuración por defecto para mutations
      retry: 1,
      retryDelay: 1000,

      // Manejo de errores global
      onError: (error) => {
        console.error('Mutation Error:', error);
      },
    },
  },
});

// Configuración de query keys para mantener consistencia
export const queryKeys = {
  // Auth
  auth: {
    session: ['auth', 'session'],
    profile: ['auth', 'profile'],
  },

  // Consumos
  consumos: {
    all: ['consumos'],
    list: (filters) => ['consumos', 'list', filters],
    detail: (id) => ['consumos', 'detail', id],
    stats: (municipioId) => ['consumos', 'stats', municipioId],
    byMunicipio: (municipioId) => ['consumos', 'municipio', municipioId],
    byFuente: (fuenteId) => ['consumos', 'fuente', fuenteId],
  },

  // Predicciones
  predicciones: {
    all: ['predicciones'],
    byMunicipio: (municipioId) => ['predicciones', 'municipio', municipioId],
    simulation: (params) => ['predicciones', 'simulation', params],
  },

  // Municipios
  municipios: {
    all: ['municipios'],
    list: (departamentoId) => ['municipios', 'list', departamentoId],
    detail: (id) => ['municipios', 'detail', id],
  },

  // Fuentes de Energía
  fuentes: {
    all: ['fuentes'],
    list: (municipioId) => ['fuentes', 'list', municipioId],
    detail: (id) => ['fuentes', 'detail', id],
    byTipo: (tipo) => ['fuentes', 'tipo', tipo],
  },

  // Alertas
  alertas: {
    all: ['alertas'],
    active: ['alertas', 'active'],
    byMunicipio: (municipioId) => ['alertas', 'municipio', municipioId],
  },

  // Departamentos
  departamentos: {
    all: ['departamentos'],
    detail: (id) => ['departamentos', 'detail', id],
  },

  // Usuarios
  usuarios: {
    all: ['usuarios'],
    list: (filters) => ['usuarios', 'list', filters],
    detail: (id) => ['usuarios', 'detail', id],
  },
};

// Funciones helper para invalidar queries
export const invalidateQueries = {
  consumos: () => queryClient.invalidateQueries({ queryKey: queryKeys.consumos.all }),
  predicciones: () => queryClient.invalidateQueries({ queryKey: queryKeys.predicciones.all }),
  municipios: () => queryClient.invalidateQueries({ queryKey: queryKeys.municipios.all }),
  fuentes: () => queryClient.invalidateQueries({ queryKey: queryKeys.fuentes.all }),
  alertas: () => queryClient.invalidateQueries({ queryKey: queryKeys.alertas.all }),
  all: () => queryClient.invalidateQueries(),
};

// Funciones helper para prefetch
export const prefetchQueries = {
  consumos: async (filters) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.consumos.list(filters),
      queryFn: () => fetchConsumos(filters),
    });
  },

  municipios: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.municipios.all,
      queryFn: () => fetchMunicipios(),
    });
  },
};

// Configuración de optimistic updates
export const optimisticUpdate = {
  addConsumo: (newConsumo) => {
    queryClient.setQueryData(queryKeys.consumos.all, (old) => {
      if (!old) return [newConsumo];
      return [newConsumo, ...old];
    });
  },

  updateConsumo: (id, updates) => {
    queryClient.setQueryData(queryKeys.consumos.detail(id), (old) => {
      if (!old) return null;
      return { ...old, ...updates };
    });
  },

  deleteConsumo: (id) => {
    queryClient.setQueryData(queryKeys.consumos.all, (old) => {
      if (!old) return [];
      return old.filter((consumo) => consumo.id !== id);
    });
  },
};

// Configuración de persistencia (opcional)
export const persistQueryClient = {
  enabled: true,
  maxAge: 1000 * 60 * 60 * 24, // 24 horas
  buster: 'v1', // Cambiar esto para invalidar toda la caché
};
// Nota: Implementar la lógica de persistencia usando librerías como react-query-persist-client si es necesario
