import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Briefcase, Building, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} ProfileFormProps
 * @property {Object} initialData - Datos del perfil
 * @property {Function} onSubmit - Callback al enviar
 * @property {Function} [onCancel] - Callback al cancelar
 * @property {boolean} [loading] - Estado de carga
 */

const ProfileForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    departamento: initialData?.departamento || '',
    cargo: initialData?.cargo || '',
    organizacion: initialData?.organizacion || '',
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
        departamento: initialData.departamento || '',
        cargo: initialData.cargo || '',
        organizacion: initialData.organizacion || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const changed =
      JSON.stringify(formData) !==
      JSON.stringify({
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        telefono: initialData?.telefono || '',
        departamento: initialData?.departamento || '',
        cargo: initialData?.cargo || '',
        organizacion: initialData?.organizacion || '',
      });
    setHasChanges(changed);
  }, [formData, initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefono && !/^[0-9]{7,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono inválido (7-15 dígitos)';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Editar Perfil</h3>
          <p className="text-sm text-gray-600">Actualiza tu información personal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Nombre Completo
          </label>
          <Input
            type="text"
            placeholder="Juan Pérez"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Teléfono (Opcional)
          </label>
          <Input
            type="tel"
            placeholder="+57 300 123 4567"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className={errors.telefono ? 'border-red-500' : ''}
          />
          {errors.telefono && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.telefono}
            </p>
          )}
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Departamento (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Ej: Santander"
            value={formData.departamento}
            onChange={(e) => handleChange('departamento', e.target.value)}
          />
        </div>

        {/* Cargo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Cargo (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Ej: Analista de Datos"
            value={formData.cargo}
            onChange={(e) => handleChange('cargo', e.target.value)}
          />
        </div>

        {/* Organización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Organización (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Ej: Gobernación de Santander"
            value={formData.organizacion}
            onChange={(e) => handleChange('organizacion', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading || !hasChanges} className="flex-1">
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>Guardar Cambios</>
            )}
          </Button>
        </div>

        {!hasChanges && (
          <p className="text-xs text-gray-500 text-center">No hay cambios para guardar</p>
        )}
      </form>
    </Card>
  );
};

export default ProfileForm;
