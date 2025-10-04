import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Zap, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useMunicipios, useFuentesEnergia } from '@/hooks';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} ConsumoFormProps
 * @property {Object} [initialData] - Datos iniciales para edición
 * @property {Function} onSubmit - Callback al enviar
 * @property {Function} [onCancel] - Callback al cancelar
 * @property {boolean} [loading] - Estado de carga
 */

const ConsumoForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const { municipios } = useMunicipios();
  const { fuentes } = useFuentesEnergia();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    anio: initialData?.anio || currentYear,
    mes: initialData?.mes || currentMonth,
    valor_kwh: initialData?.valor_kwh || '',
    municipio_id: initialData?.municipio_id || '',
    fuente_id: initialData?.fuente_id || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        anio: initialData.anio || currentYear,
        mes: initialData.mes || currentMonth,
        valor_kwh: initialData.valor_kwh || '',
        municipio_id: initialData.municipio_id || '',
        fuente_id: initialData.fuente_id || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.anio || formData.anio < 2000 || formData.anio > currentYear + 1) {
      newErrors.anio = 'Año inválido';
    }

    if (!formData.mes || formData.mes < 1 || formData.mes > 12) {
      newErrors.mes = 'Mes inválido';
    }

    if (!formData.valor_kwh || formData.valor_kwh <= 0) {
      newErrors.valor_kwh = 'Debe ingresar un valor positivo';
    }

    if (formData.valor_kwh > 1000000) {
      newErrors.valor_kwh = 'El valor parece muy alto, verifique';
    }

    if (!formData.municipio_id) {
      newErrors.municipio_id = 'Seleccione un municipio';
    }

    if (!formData.fuente_id) {
      newErrors.fuente_id = 'Seleccione una fuente de energía';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      anio: true,
      mes: true,
      valor_kwh: true,
      municipio_id: true,
      fuente_id: true,
    });

    if (!validate()) {
      toast.error('Por favor corrija los errores del formulario');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        valor_kwh: parseFloat(formData.valor_kwh),
        anio: parseInt(formData.anio),
        mes: parseInt(formData.mes),
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {initialData ? 'Editar Consumo' : 'Registrar Nuevo Consumo'}
          </h3>
          <p className="text-sm text-gray-600">Complete la información del consumo energético</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Año
            </label>
            <Select
              value={formData.anio}
              onChange={(e) => handleChange('anio', e.target.value)}
              onBlur={() => handleBlur('anio')}
              className={touched.anio && errors.anio ? 'border-red-500' : ''}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            {touched.anio && errors.anio && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.anio}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <Select
              value={formData.mes}
              onChange={(e) => handleChange('mes', e.target.value)}
              onBlur={() => handleBlur('mes')}
              className={touched.mes && errors.mes ? 'border-red-500' : ''}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </Select>
            {touched.mes && errors.mes && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.mes}
              </p>
            )}
          </div>
        </div>

        {/* Municipio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Municipio
          </label>
          <Select
            value={formData.municipio_id}
            onChange={(e) => handleChange('municipio_id', e.target.value)}
            onBlur={() => handleBlur('municipio_id')}
            className={touched.municipio_id && errors.municipio_id ? 'border-red-500' : ''}
          >
            <option value="">Seleccione un municipio</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </Select>
          {touched.municipio_id && errors.municipio_id && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.municipio_id}
            </p>
          )}
        </div>

        {/* Fuente de Energía */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline mr-1" />
            Fuente de Energía
          </label>
          <Select
            value={formData.fuente_id}
            onChange={(e) => handleChange('fuente_id', e.target.value)}
            onBlur={() => handleBlur('fuente_id')}
            className={touched.fuente_id && errors.fuente_id ? 'border-red-500' : ''}
          >
            <option value="">Seleccione una fuente</option>
            {fuentes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.tipo}
              </option>
            ))}
          </Select>
          {touched.fuente_id && errors.fuente_id && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.fuente_id}
            </p>
          )}
        </div>

        {/* Valor kWh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Consumo (kWh)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="Ej: 15000"
            value={formData.valor_kwh}
            onChange={(e) => handleChange('valor_kwh', e.target.value)}
            onBlur={() => handleBlur('valor_kwh')}
            className={touched.valor_kwh && errors.valor_kwh ? 'border-red-500' : ''}
          />
          {touched.valor_kwh && errors.valor_kwh && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.valor_kwh}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Ingrese el valor total del consumo en kWh</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>{initialData ? 'Actualizar' : 'Registrar'} Consumo</>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ConsumoForm;
