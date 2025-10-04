import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, X } from 'lucide-react';
import { useMunicipios } from '@/hooks';

/**
 * @typedef {Object} MunicipioSelectorProps
 * @property {Array<string>} [value] - IDs de municipios seleccionados
 * @property {Function} onChange - Callback con municipios seleccionados
 * @property {boolean} [multiple] - Permitir selección múltiple
 * @property {number} [max] - Máximo de selecciones (si multiple)
 * @property {string} [placeholder] - Texto placeholder
 */

const MunicipioSelector = ({
  value = [],
  onChange,
  multiple = false,
  max = 5,
  placeholder = 'Seleccionar municipio...',
}) => {
  const { municipios, loading } = useMunicipios();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(value);

  useEffect(() => {
    setSelectedIds(value);
  }, [value]);

  const filteredMunicipios = municipios.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo_dane?.includes(searchTerm)
  );

  const selectedMunicipios = municipios.filter((m) => selectedIds.includes(m.id));

  const handleSelect = (municipioId) => {
    if (multiple) {
      const newSelection = selectedIds.includes(municipioId)
        ? selectedIds.filter((id) => id !== municipioId)
        : [...selectedIds, municipioId].slice(0, max);

      setSelectedIds(newSelection);
      onChange(newSelection);
    } else {
      setSelectedIds([municipioId]);
      onChange([municipioId]);
    }
  };

  const handleRemove = (municipioId) => {
    const newSelection = selectedIds.filter((id) => id !== municipioId);
    setSelectedIds(newSelection);
    onChange(newSelection);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected municipios */}
      {selectedMunicipios.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMunicipios.map((m) => (
            <Badge key={m.id} className="bg-primary-100 text-primary-800 pr-1">
              <MapPin className="w-3 h-3 mr-1" />
              {m.nombre}
              <button
                onClick={() => handleRemove(m.id)}
                className="ml-2 p-0.5 hover:bg-primary-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Municipios list */}
      {searchTerm && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          {filteredMunicipios.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron municipios
            </div>
          ) : (
            <div className="divide-y">
              {filteredMunicipios.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  disabled={multiple && selectedIds.length >= max && !selectedIds.includes(m.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedIds.includes(m.id) ? 'bg-primary-50' : ''
                  } ${
                    multiple && selectedIds.length >= max && !selectedIds.includes(m.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.nombre}</p>
                      {m.departamentos?.nombre && (
                        <p className="text-xs text-gray-500">{m.departamentos.nombre}</p>
                      )}
                    </div>
                  </div>
                  {selectedIds.includes(m.id) && (
                    <Badge size="sm" className="bg-primary-600">
                      Seleccionado
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Counter */}
      {multiple && (
        <p className="text-xs text-gray-500 text-right">
          {selectedIds.length} / {max} seleccionados
        </p>
      )}
    </div>
  );
};

export default MunicipioSelector;
