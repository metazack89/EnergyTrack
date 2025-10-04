/**
 * Índice de todos los custom hooks
 * Exporta todos los hooks para fácil importación
 *
 * @example
 * import { useAuth, useConsumos, useDebounce } from '@/hooks'
 */

// Context hooks
export { useAuth } from './useAuth';
export { useAlertas } from './useAlertas';

// Data fetching hooks
export { useConsumos } from './useConsumos';
export { usePredicciones } from './usePredicciones';
export { useMunicipios } from './useMunicipios';
export { useFuentesEnergia } from './useFuentesEnergia';

// Utility hooks
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDark,
} from './useMediaQuery';
export { useExport } from './useExport';
