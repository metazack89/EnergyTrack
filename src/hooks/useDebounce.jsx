import { useState, useEffect } from 'react';

/**
 * Hook para hacer debounce de un valor
 * Útil para búsquedas en tiempo real y optimizar requests
 *
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Delay en milisegundos (default: 500ms)
 * @returns {any} Valor con debounce aplicado
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 500)
 *
 * useEffect(() => {
 *   // Esta búsqueda solo se ejecutará 500ms después de que el usuario deje de escribir
 *   if (debouncedSearch) {
 *     searchAPI(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurar el timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timer si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
