import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

/**
 * @typedef {Object} DateRange
 * @property {Date} start - Fecha inicio
 * @property {Date} end - Fecha fin
 */

/**
 * @typedef {Object} DateRangePickerProps
 * @property {DateRange} value - Rango seleccionado
 * @property {Function} onChange - Callback con nuevo rango
 * @property {Date} [minDate] - Fecha mínima permitida
 * @property {Date} [maxDate] - Fecha máxima permitida
 * @property {Array<Object>} [presets] - Rangos predefinidos
 */

const DateRangePicker = ({
  value,
  onChange,
  minDate,
  maxDate = new Date(),
  presets = [
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Último año', days: 365 },
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(value?.start || null);
  const [tempEnd, setTempEnd] = useState(value?.end || null);

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onChange({ start, end });
    setIsOpen(false);
  };

  const applyCustom = () => {
    if (tempStart && tempEnd) {
      onChange({ start: new Date(tempStart), end: new Date(tempEnd) });
      setIsOpen(false);
    }
  };

  const clearSelection = () => {
    setTempStart(null);
    setTempEnd(null);
    onChange(null);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {value ? (
            <span className="text-sm">
              {formatDate(value.start)} - {formatDate(value.end)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Seleccionar rango...</span>
          )}
        </div>
        {value && (
          <X
            className="w-4 h-4 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
          />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 shadow-lg">
            {/* Presets */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Rangos Rápidos</p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset.days)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom range */}
            <div className="pt-4 border-t">
              <p className="text-xs font-medium text-gray-700 mb-2">Rango Personalizado</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">Fecha Inicio</label>
                  <Input
                    type="date"
                    value={formatDateForInput(tempStart)}
                    onChange={(e) => setTempStart(e.target.value)}
                    min={minDate ? formatDateForInput(minDate) : undefined}
                    max={formatDateForInput(maxDate)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Fecha Fin</label>
                  <Input
                    type="date"
                    value={formatDateForInput(tempEnd)}
                    onChange={(e) => setTempEnd(e.target.value)}
                    min={tempStart ? formatDateForInput(tempStart) : undefined}
                    max={formatDateForInput(maxDate)}
                  />
                </div>
                <Button
                  onClick={applyCustom}
                  disabled={!tempStart || !tempEnd}
                  className="w-full"
                  size="sm"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
