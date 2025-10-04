import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} FuenteEnergiaFormProps
 * @property {Object} [initialData] - Datos iniciales para edición
 * @property {Function} onSubmit - Callback al enviar
 * @property {Function} [onCancel] - Callback al cancelar
 * @property {boolean} [loading] - Estado de carga
 */

const FuenteEnergiaForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    tipo: initialData?.tipo || '',
    descripcion: initialData?.descripcion || '',
    categoria: initialData?.categoria || 'renovable',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipo: initialData.tipo || '',
        descripcion: initialData.descripcion || '',
        categoria: initialData.categoria || 'renovable',
      });
    }
  }, [initialData]);

  const tiposPredefindidos = [
    { value: 'solar', label: 'Solar', categoria: 'renovable' },
    { value: 'eolica', label: 'Eólica', categoria: 'renovable' },
    { value: 'hidroelectrica', label: 'Hidroeléctrica', categoria: 'renovable' },
    { value: 'biomasa', label: 'Biomasa', categoria: 'renovable' },
    { value: 'geotermica', label: 'Geotérmica', categoria: 'renovable' },
    { value: 'termica', label: 'Térmica', categoria: 'no-renovable' },
    { value: 'carbon', label: 'Carbón', categoria: 'no-renovable' },
    { value: 'gas', label: 'Gas Natural', categoria: 'no-renovable' },
    { value: 'nuclear', label: 'Nuclear', categoria: 'no-renovable' },
    { value: 'otra', label: 'Otra', categoria: 'renovable' },
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.tipo || formData.tipo.trim().length < 3) {
      newErrors.tipo = 'El tipo debe tener al menos 3 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'Máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTipoChange = (value) => {
    const tipo = tiposPredefindidos.find((t) => t.value === value);
    if (tipo) {
      setFormData((prev) => ({
        ...prev,
        tipo: tipo.label,
        categoria: tipo.categoria,
      }));
    } else {
      handleChange('tipo', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrija los errores');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Zap className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {initialData ? 'Editar Fuente de Energía' : 'Nueva Fuente de Energía'}
          </h3>
          <p className="text-sm text-gray-600">Configure los datos de la fuente energética</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo - Select predefinido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Fuente</label>
          <Select
            value={formData.tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            className={errors.tipo ? 'border-red-500' : ''}
          >
            <option value="">Seleccione un tipo</option>
            <optgroup label="Renovables">
              {tiposPredefindidos
                .filter((t) => t.categoria === 'renovable')
                .map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="No Renovables">
              {tiposPredefindidos
                .filter((t) => t.categoria === 'no-renovable')
                .map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
            </optgroup>
          </Select>
          {errors.tipo && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.tipo}
            </p>
          )}
        </div>

        {/* Tipo personalizado - Input */}
        {formData.tipo === 'Otra' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especificar Tipo</label>
            <Input
              type="text"
              placeholder="Ej: Mareomotriz"
              value={formData.tipo === 'Otra' ? '' : formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
            />
          </div>
        )}

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <Select
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
          >
            <option value="renovable">Renovable</option>
            <option value="no-renovable">No Renovable</option>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Las fuentes renovables son preferidas para cálculos de sostenibilidad
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Información adicional sobre esta fuente de energía..."
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formData.descripcion.length}/500 caracteres</span>
            {errors.descripcion && (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.descripcion}
              </span>
            )}
          </div>
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
              <>{initialData ? 'Actualizar' : 'Crear'} Fuente</>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FuenteEnergiaForm;
