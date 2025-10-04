import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

/**
 * @typedef {Object} SearchBarProps
 * @property {string} [value] - Valor de búsqueda controlado
 * @property {Function} onSearch - Callback al realizar búsqueda
 * @property {string} [placeholder] - Texto placeholder
 * @property {number} [debounceMs] - Milisegundos de debounce
 * @property {boolean} [autoFocus] - Auto-focus en el input
 */

/**
 * Barra de búsqueda con debounce automático
 * Ejecuta búsqueda después de un delay para optimizar rendimiento
 *
 * @param {SearchBarProps} props - Propiedades del componente
 * @example
 * <SearchBar
 *   placeholder="Buscar municipios..."
 *   onSearch={(query) => filterData(query)}
 *   debounceMs={500}
 * />
 */
const SearchBar = ({
  value: controlledValue,
  onSearch,
  placeholder = 'Buscar...',
  debounceMs = 300,
  autoFocus = false,
}) => {
  // Estado local para el input
  const [searchValue, setSearchValue] = useState(controlledValue || '');

  /**
   * Sincronizar con valor controlado externo
   */
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchValue(controlledValue);
    }
  }, [controlledValue]);

  /**
   * Implementar debounce para búsqueda
   * Evita ejecutar onSearch en cada tecla presionada
   */
  useEffect(() => {
    // Solo aplicar debounce si hay valor o si se borró
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, debounceMs);

    // Cleanup: cancelar timer anterior
    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearch]);

  /**
   * Limpiar búsqueda
   */
  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  /**
   * Manejar submit del formulario (Enter)
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Icono de búsqueda */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {/* Input de búsqueda */}
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-10 pr-10"
      />

      {/* Botón limpiar (solo si hay texto) */}
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
