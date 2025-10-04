import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw, Search } from 'lucide-react';
import { useMunicipios, useFuentesEnergia } from '@/hooks';

/**
 * @typedef {Object} FilterFormProps
 * @property {Object} [initialFilters] - Filtros iniciales
 * @property {Function} onApply - Callback al aplicar filtros
 * @property {Function} [onReset] - Callback al resetear
 * @property {boolean} [showAdvanced] - Mostrar filtros avanzados
 */

const FilterForm = ({ initialFilters = {}, onApply, onReset, showAdvanced = true }) => {
  const { municipios } = useMunicipios();
  const { fuentes } = useFuentesEnergia();

  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    anio: initialFilters.anio || '',
    mes: initialFilters.mes || '',
    municipio_id: initialFilters.municipio_id || '',
    fuente_id: initialFilters.fuente_id || '',
    min_kwh: initialFilters.min_kwh || '',
    max_kwh: initialFilters.max_kwh || '',
    fecha_inicio: initialFilters.fecha_inicio || '',
    fecha_fin: initialFilters.fecha_fin || '',
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Contar filtros activos
    const count = Object.values(filters).filter((value) => value !== '' && value !== null).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    // Limpiar valores vacíos
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onApply(cleanFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      search: '',
      anio: '',
      mes: '',
      municipio_id: '',
      fuente_id: '',
      min_kwh: '',
      max_kwh: '',
      fecha_inicio: '',
      fecha_fin: '',
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onReset?.();
  };

  const handleRemoveFilter = (field) => {
    handleChange(field, '');
  };

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ key: 'search', label: 'Búsqueda', value: filters.search });
    if (filters.anio) active.push({ key: 'anio', label: 'Año', value: filters.anio });
    if (filters.mes) active.push({ key: 'mes', label: 'Mes', value: months[filters.mes - 1] });
    if (filters.municipio_id) {
      const muni = municipios.find((m) => m.id === filters.municipio_id);
      active.push({ key: 'municipio_id', label: 'Municipio', value: muni?.nombre });
    }
    if (filters.fuente_id) {
      const fuente = fuentes.find((f) => f.id === filters.fuente_id);
      active.push({ key: 'fuente_id', label: 'Fuente', value: fuente?.tipo });
    }
    if (filters.min_kwh) active.push({ key: 'min_kwh', label: 'Mín kWh', value: filters.min_kwh });
    if (filters.max_kwh) active.push({ key: 'max_kwh', label: 'Máx kWh', value: filters.max_kwh });
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge className="bg-primary-100 text-primary-800">{activeFiltersCount}</Badge>
          )}
        </div>
        {showAdvanced && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Menos' : 'Más'} filtros
          </Button>
        )}
      </div>

      {/* Active filters tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="outline" className="pr-1">
              <span className="text-xs">
                <strong>{filter.label}:</strong> {filter.value}
              </span>
              <button
                onClick={() => handleRemoveFilter(filter.key)}
                className="ml-2 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Limpiar todo
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Búsqueda general */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <Select value={filters.anio} onChange={(e) => handleChange('anio', e.target.value)}>
              <option value="">Todos</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <Select value={filters.mes} onChange={(e) => handleChange('mes', e.target.value)}>
              <option value="">Todos</option>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </Select>
          </div>

          {/* Municipio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Municipio</label>
            <Select
              value={filters.municipio_id}
              onChange={(e) => handleChange('municipio_id', e.target.value)}
            >
              <option value="">Todos</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && isExpanded && (
          <div className="pt-4 border-t space-y-4">
            <p className="text-sm font-medium text-gray-700">Filtros Avanzados</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fuente de energía */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente de Energía
                </label>
                <Select
                  value={filters.fuente_id}
                  onChange={(e) => handleChange('fuente_id', e.target.value)}
                >
                  <option value="">Todas</option>
                  {fuentes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.tipo}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Rango de consumo */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mín (kWh)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.min_kwh}
                    onChange={(e) => handleChange('min_kwh', e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Máx (kWh)</label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={filters.max_kwh}
                    onChange={(e) => handleChange('max_kwh', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Rango de fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filters.fecha_inicio}
                  onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <Input
                  type="date"
                  value={filters.fecha_fin}
                  onChange={(e) => handleChange('fecha_fin', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} disabled={activeFiltersCount === 0}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
          <Button onClick={handleApply} className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FilterForm;
