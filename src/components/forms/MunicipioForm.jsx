import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} MunicipioFormProps
 * @property {Object} [initialData] - Datos iniciales para edición
 * @property {Array} departamentos - Lista de departamentos
 * @property {Function} onSubmit - Callback al enviar
 * @property {Function} [onCancel] - Callback al cancelar
 * @property {boolean} [loading] - Estado de carga
 */

const MunicipioForm = ({
  initialData,
  departamentos = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    codigo_dane: initialData?.codigo_dane || '',
    departamento_id: initialData?.departamento_id || '',
    poblacion: initialData?.poblacion || '',
    area_km2: initialData?.area_km2 || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        codigo_dane: initialData.codigo_dane || '',
        departamento_id: initialData.departamento_id || '',
        poblacion: initialData.poblacion || '',
        area_km2: initialData.area_km2 || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.codigo_dane) {
      newErrors.codigo_dane = 'El código DANE es requerido';
    } else if (!/^\d{5}$/.test(formData.codigo_dane)) {
      newErrors.codigo_dane = 'El código DANE debe tener 5 dígitos';
    }

    if (!formData.departamento_id) {
      newErrors.departamento_id = 'Seleccione un departamento';
    }

    if (formData.poblacion && (isNaN(formData.poblacion) || formData.poblacion < 0)) {
      newErrors.poblacion = 'Población inválida';
    }

    if (formData.area_km2 && (isNaN(formData.area_km2) || formData.area_km2 <= 0)) {
      newErrors.area_km2 = 'Área inválida';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrija los errores');
      return;
    }

    try {
      const submitData = {
        ...formData,
        poblacion: formData.poblacion ? parseInt(formData.poblacion) : null,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : null,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {initialData ? 'Editar Municipio' : 'Nuevo Municipio'}
          </h3>
          <p className="text-sm text-gray-600">Configure los datos del municipio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Municipio
          </label>
          <Input
            type="text"
            placeholder="Ej: Bucaramanga"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.nombre}
            </p>
          )}
        </div>

        {/* Código DANE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Código DANE</label>
          <Input
            type="text"
            placeholder="68001"
            value={formData.codigo_dane}
            onChange={(e) => handleChange('codigo_dane', e.target.value)}
            className={errors.codigo_dane ? 'border-red-500' : ''}
            maxLength={5}
          />
          {errors.codigo_dane && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.codigo_dane}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Código único de 5 dígitos del DANE</p>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
          <Select
            value={formData.departamento_id}
            onChange={(e) => handleChange('departamento_id', e.target.value)}
            className={errors.departamento_id ? 'border-red-500' : ''}
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nombre}
              </option>
            ))}
          </Select>
          {errors.departamento_id && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.departamento_id}
            </p>
          )}
        </div>

        {/* Población */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Población (Opcional)
          </label>
          <Input
            type="number"
            placeholder="Ej: 581130"
            value={formData.poblacion}
            onChange={(e) => handleChange('poblacion', e.target.value)}
            className={errors.poblacion ? 'border-red-500' : ''}
            min="0"
          />
          {errors.poblacion && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.poblacion}
            </p>
          )}
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área (km²) (Opcional)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="Ej: 165.6"
            value={formData.area_km2}
            onChange={(e) => handleChange('area_km2', e.target.value)}
            className={errors.area_km2 ? 'border-red-500' : ''}
            min="0"
          />
          {errors.area_km2 && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.area_km2}
            </p>
          )}
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
              <>{initialData ? 'Actualizar' : 'Crear'} Municipio</>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MunicipioForm;
