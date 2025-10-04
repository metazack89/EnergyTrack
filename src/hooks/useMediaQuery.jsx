import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries en React
 * Útil para diseño responsive
 *
 * @param {string} query - Media query CSS
 * @returns {boolean} True si el media query coincide
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    // Establecer valor inicial
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener para cambios
    const listener = (event) => setMatches(event.matches);

    // Método moderno
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback para navegadores antiguos
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
};

/**
 * Hook predefinido para detectar dispositivos móviles
 * @returns {boolean} True si es móvil (max-width: 768px)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');

/**
 * Hook predefinido para detectar tablets
 * @returns {boolean} True si es tablet (769px - 1024px)
 */
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

/**
 * Hook predefinido para detectar desktop
 * @returns {boolean} True si es desktop (min-width: 1025px)
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

/**
 * Hook predefinido para detectar modo oscuro del sistema
 * @returns {boolean} True si el sistema prefiere modo oscuro
 */
export const usePrefersDark = () => useMediaQuery('(prefers-color-scheme: dark)');
