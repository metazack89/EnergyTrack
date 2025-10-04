import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useConsumos, useMunicipios, useFuentesEnergia } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Zap,
  Save,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const NuevoConsumo = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Para edición
  const { profile, isGestor } = useAuth();
  const { consumos, createConsumo, updateConsumo, getConsumoById } = useConsumos();
  const { municipios } = useMunicipios();
  const { fuentes } = useFuentesEnergia();

  const isEditing = !!id;

  const [formData, setFormData] = useState({
    municipio_id: '',
    fuente_id: '',
    valor_kwh: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    notas: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [consumoAnterior, setConsumoAnterior] = useState(null);
  const [promedioMunicipio, setPromedioMunicipio] = useState(null);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      loadConsumo();
    }
  }, [id]);

  // Calcular consumo anterior y promedio cuando cambian municipio/fuente
  useEffect(() => {
    if (formData.municipio_id && formData.fuente_id) {
      calcularEstadisticas();
    }
  }, [formData.municipio_id, formData.fuente_id, formData.mes, formData.anio]);

  const loadConsumo = async () => {
    try {
      setLoading(true);
      const consumo = await getConsumoById(id);
      if (consumo) {
        setFormData({
          municipio_id: consumo.municipio_id?.toString() || '',
          fuente_id: consumo.fuente_id?.toString() || '',
          valor_kwh: consumo.valor_kwh?.toString() || '',
          mes: consumo.mes,
          anio: consumo.anio,
          notas: consumo.notas || '',
        });
      }
    } catch (error) {
      console.error('Error loading consumo:', error);
      toast.error('Error al cargar el consumo');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    // Filtrar consumos del mismo municipio y fuente
    const consumosFiltrados = consumos.filter(
      (c) =>
        c.municipio_id === parseInt(formData.municipio_id) &&
        c.fuente_id === parseInt(formData.fuente_id)
    );

    if (consumosFiltrados.length === 0) {
      setConsumoAnterior(null);
      setPromedioMunicipio(null);
      return;
    }

    // Encontrar consumo del mes anterior
    const mesAnterior = formData.mes === 1 ? 12 : formData.mes - 1;
    const anioAnterior = formData.mes === 1 ? formData.anio - 1 : formData.anio;

    const anterior = consumosFiltrados.find(
      (c) => c.mes === mesAnterior && c.anio === anioAnterior
    );
    setConsumoAnterior(anterior);

    // Calcular promedio
    const suma = consumosFiltrados.reduce((acc, c) => acc + Number(c.valor_kwh), 0);
    const promedio = suma / consumosFiltrados.length;
    setPromedioMunicipio(promedio);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.municipio_id) {
      newErrors.municipio_id = 'Selecciona un municipio';
    }

    if (!formData.fuente_id) {
      newErrors.fuente_id = 'Selecciona una fuente de energía';
    }

    if (!formData.valor_kwh) {
      newErrors.valor_kwh = 'Ingresa el valor del consumo';
    } else if (isNaN(formData.valor_kwh) || Number(formData.valor_kwh) <= 0) {
      newErrors.valor_kwh = 'El valor debe ser un número positivo';
    } else if (Number(formData.valor_kwh) > 1000000) {
      newErrors.valor_kwh = 'El valor parece demasiado alto';
    }

    if (!formData.mes || formData.mes < 1 || formData.mes > 12) {
      newErrors.mes = 'Selecciona un mes válido';
    }

    if (!formData.anio || formData.anio < 2000 || formData.anio > new Date().getFullYear() + 1) {
      newErrors.anio = 'Selecciona un año válido';
    }

    // Verificar si ya existe un registro para ese municipio, fuente, mes y año
    if (!isEditing) {
      const existe = consumos.some(
        (c) =>
          c.municipio_id === parseInt(formData.municipio_id) &&
          c.fuente_id === parseInt(formData.fuente_id) &&
          c.mes === parseInt(formData.mes) &&
          c.anio === parseInt(formData.anio)
      );

      if (existe) {
        newErrors.general = 'Ya existe un registro para este municipio, fuente y período';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    try {
      setLoading(true);

      const data = {
        municipio_id: parseInt(formData.municipio_id),
        fuente_id: parseInt(formData.fuente_id),
        valor_kwh: parseFloat(formData.valor_kwh),
        mes: parseInt(formData.mes),
        anio: parseInt(formData.anio),
        notas: formData.notas.trim() || null,
      };

      if (isEditing) {
        await updateConsumo(id, data);
        toast.success('Consumo actualizado exitosamente');
      } else {
        await createConsumo(data);
        toast.success('Consumo registrado exitosamente');
      }

      navigate('/consumos');
    } catch (error) {
      console.error('Error saving consumo:', error);
      toast.error(error.message || 'Error al guardar el consumo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const calcularVariacion = () => {
    if (!consumoAnterior || !formData.valor_kwh) return null;

    const variacion =
      ((Number(formData.valor_kwh) - Number(consumoAnterior.valor_kwh)) /
        Number(consumoAnterior.valor_kwh)) *
      100;
    return variacion;
  };

  const variacion = calcularVariacion();

  if (!isGestor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para registrar consumos</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/consumos')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la lista
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary-600" />
              {isEditing ? 'Editar Consumo' : 'Registrar Nuevo Consumo'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing
                ? 'Actualiza los datos del registro de consumo'
                : 'Completa los datos para registrar un nuevo consumo de energía'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Formulario */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error general */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                )}

                {/* Período */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-2">
                      Mes *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Select
                        id="mes"
                        name="mes"
                        value={formData.mes}
                        onChange={handleChange}
                        className={`pl-10 ${errors.mes ? 'border-red-500' : ''}`}
                        required
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {errors.mes && <p className="mt-1 text-sm text-red-600">{errors.mes}</p>}
                  </div>

                  <div>
                    <label htmlFor="anio" className="block text-sm font-medium text-gray-700 mb-2">
                      Año *
                    </label>
                    <Input
                      id="anio"
                      name="anio"
                      type="number"
                      value={formData.anio}
                      onChange={handleChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className={errors.anio ? 'border-red-500' : ''}
                      required
                    />
                    {errors.anio && <p className="mt-1 text-sm text-red-600">{errors.anio}</p>}
                  </div>
                </div>

                {/* Municipio */}
                <div>
                  <label
                    htmlFor="municipio_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Municipio *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Select
                      id="municipio_id"
                      name="municipio_id"
                      value={formData.municipio_id}
                      onChange={handleChange}
                      className={`pl-10 ${errors.municipio_id ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Seleccionar municipio...</option>
                      {municipios.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} - {m.departamentos?.nombre}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {errors.municipio_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.municipio_id}</p>
                  )}
                </div>

                {/* Fuente de Energía */}
                <div>
                  <label
                    htmlFor="fuente_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fuente de Energía *
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Select
                      id="fuente_id"
                      name="fuente_id"
                      value={formData.fuente_id}
                      onChange={handleChange}
                      className={`pl-10 ${errors.fuente_id ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Seleccionar fuente...</option>
                      {fuentes
                        .filter((f) => f.estado === 'activa')
                        .map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nombre} ({f.tipo})
                          </option>
                        ))}
                    </Select>
                  </div>
                  {errors.fuente_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.fuente_id}</p>
                  )}
                </div>

                {/* Consumo en kWh */}
                <div>
                  <label
                    htmlFor="valor_kwh"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Consumo (kWh) *
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="valor_kwh"
                      name="valor_kwh"
                      type="number"
                      step="0.01"
                      value={formData.valor_kwh}
                      onChange={handleChange}
                      placeholder="Ej: 15000.50"
                      className={`pl-10 ${errors.valor_kwh ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.valor_kwh && (
                    <p className="mt-1 text-sm text-red-600">{errors.valor_kwh}</p>
                  )}

                  {/* Mostrar variación si hay consumo anterior */}
                  {variacion !== null && formData.valor_kwh && (
                    <div
                      className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${
                        variacion > 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 ${variacion < 0 ? 'transform rotate-180' : ''}`}
                      />
                      <p className="text-sm">
                        {variacion > 0 ? 'Aumento' : 'Disminución'} de{' '}
                        <strong>{Math.abs(variacion).toFixed(1)}%</strong> vs mes anterior (
                        {formatNumber(consumoAnterior.valor_kwh, 0)} kWh)
                      </p>
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (Opcional)
                  </label>
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Añade cualquier observación relevante sobre este consumo..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/consumos')}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? 'Actualizar' : 'Registrar'} Consumo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* Columna lateral - Información y estadísticas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ayuda */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Consejos para el registro</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Verifica que el período sea correcto</li>
                    <li>• Asegúrate de que el municipio y fuente sean los correctos</li>
                    <li>• El consumo debe estar en kWh</li>
                    <li>• Añade notas si hay datos inusuales</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Estadísticas del municipio */}
          {promedioMunicipio && formData.municipio_id && formData.fuente_id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Promedio histórico</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(promedioMunicipio, 0)}
                      </p>
                      <p className="text-xs text-gray-500">kWh</p>
                    </div>
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>

                  {consumoAnterior && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Mes anterior</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatNumber(consumoAnterior.valor_kwh, 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(consumoAnterior.anio, consumoAnterior.mes - 1).toLocaleString(
                            'es',
                            {
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {formData.valor_kwh && promedioMunicipio && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Comparación con promedio</p>
                      <div className="flex items-center gap-2">
                        {Number(formData.valor_kwh) > promedioMunicipio ? (
                          <>
                            <div className="flex-1 h-2 bg-red-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${Math.min(
                                    ((Number(formData.valor_kwh) - promedioMunicipio) /
                                      promedioMunicipio) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-red-600">
                              +
                              {formatNumber(
                                ((Number(formData.valor_kwh) - promedioMunicipio) /
                                  promedioMunicipio) *
                                  100,
                                0
                              )}
                              %
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${Math.min(
                                    ((promedioMunicipio - Number(formData.valor_kwh)) /
                                      promedioMunicipio) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              -
                              {formatNumber(
                                ((promedioMunicipio - Number(formData.valor_kwh)) /
                                  promedioMunicipio) *
                                  100,
                                0
                              )}
                              %
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Fuente seleccionada */}
          {formData.fuente_id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Fuente Seleccionada</h3>
                {(() => {
                  const fuenteSeleccionada = fuentes.find(
                    (f) => f.id === parseInt(formData.fuente_id)
                  );
                  if (!fuenteSeleccionada) return null;

                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium text-gray-900">{fuenteSeleccionada.nombre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {fuenteSeleccionada.tipo}
                        </p>
                      </div>
                      {fuenteSeleccionada.capacidad_mw && (
                        <div>
                          <p className="text-sm text-gray-600">Capacidad</p>
                          <p className="font-medium text-gray-900">
                            {formatNumber(fuenteSeleccionada.capacidad_mw, 2)} MW
                          </p>
                        </div>
                      )}
                      {fuenteSeleccionada.ubicacion && (
                        <div>
                          <p className="text-sm text-gray-600">Ubicación</p>
                          <p className="font-medium text-gray-900">
                            {fuenteSeleccionada.ubicacion}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoConsumo;
