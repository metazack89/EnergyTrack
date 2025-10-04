import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  Play,
  RotateCcw,
  Save,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  AlertCircle,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} ScenarioSimulatorProps
 * @property {Array<Object>} baselinePrediction - Predicción base [{fecha, valor}]
 * @property {Function} onSimulate - Callback para simular escenarios
 * @property {Function} [onSaveScenario] - Callback para guardar escenario
 * @property {string} [municipio] - Nombre del municipio
 */

/**
 * Simulador interactivo de escenarios energéticos
 * Permite ajustar múltiples variables y analizar el impacto
 * en consumo, costos y emisiones
 */
const ScenarioSimulator = ({
  baselinePrediction = [],
  onSimulate,
  onSaveScenario,
  municipio = 'Municipio',
}) => {
  // Estados de parámetros de simulación
  const [params, setParams] = useState({
    // Parámetro de reducción/aumento objetivo (-50% a +50%)
    reduccionObjetivo: 0,

    // Mejora de eficiencia energética (0% a 50%)
    eficienciaEnergetica: 0,

    // Crecimiento poblacional anual (0% a 10%)
    crecimientoPoblacional: 2,

    // Nueva infraestructura en kWh
    nuevaInfraestructura: 0,

    // Meses a simular (6, 12, 24, 36)
    mesesSimulacion: 12,

    // Parámetros económicos
    precioKwh: 800, // COP por kWh
    factorEmision: 0.5, // kg CO2 por kWh
    inversionEficiencia: 0, // COP inversión en eficiencia
  });

  // Estados de control
  const [scenarios, setScenarios] = useState([]); // Escenarios guardados
  const [activeScenario, setActiveScenario] = useState(null); // Escenario activo
  const [isSimulating, setIsSimulating] = useState(false); // Estado de simulación

  /**
   * Calcular escenario basado en parámetros
   * Aplica todas las variables de forma secuencial
   */
  const calculateScenario = () => {
    return baselinePrediction.slice(0, params.mesesSimulacion).map((point, index) => {
      let valor = point.valor;

      // 1. Aplicar reducción/aumento objetivo
      // Ejemplo: -10% reduce el consumo en 10%
      valor = valor * (1 + params.reduccionObjetivo / 100);

      // 2. Aplicar mejora de eficiencia energética
      // Reduce el consumo según el porcentaje de mejora
      valor = valor * (1 - params.eficienciaEnergetica / 100);

      // 3. Aplicar crecimiento poblacional compuesto mensual
      // Fórmula: valor * (1 + tasa/12)^meses
      const mesesTranscurridos = index;
      const tasaMensual = params.crecimientoPoblacional / 100 / 12;
      const factorCrecimiento = Math.pow(1 + tasaMensual, mesesTranscurridos);
      valor = valor * factorCrecimiento;

      // 4. Agregar consumo de nueva infraestructura
      valor = valor + params.nuevaInfraestructura;

      // Asegurar que el valor no sea negativo
      valor = Math.max(0, valor);

      // Calcular métricas derivadas
      return {
        ...point,
        valorSimulado: valor,
        costo: valor * params.precioKwh,
        emisionesCO2: valor * params.factorEmision,
      };
    });
  };

  /**
   * Manejar simulación
   * Genera nuevo escenario y actualiza visualización
   */
  const handleSimulate = () => {
    setIsSimulating(true);

    // Simular delay para mejor UX
    setTimeout(() => {
      const newScenarioData = calculateScenario();

      const newScenario = {
        id: Date.now(),
        nombre: `Escenario ${scenarios.length + 1}`,
        params: { ...params },
        data: newScenarioData,
        createdAt: new Date(),
      };

      setActiveScenario(newScenario);
      onSimulate?.(newScenarioData, params);
      setIsSimulating(false);
    }, 500);
  };

  /**
   * Guardar escenario actual
   */
  const handleSaveScenario = () => {
    if (!activeScenario) return;

    setScenarios((prev) => [...prev, activeScenario]);
    onSaveScenario?.(activeScenario);
  };

  /**
   * Resetear parámetros a valores por defecto
   */
  const handleReset = () => {
    setParams({
      reduccionObjetivo: 0,
      eficienciaEnergetica: 0,
      crecimientoPoblacional: 2,
      nuevaInfraestructura: 0,
      mesesSimulacion: 12,
      precioKwh: 800,
      factorEmision: 0.5,
      inversionEficiencia: 0,
    });
    setActiveScenario(null);
  };

  /**
   * Calcular diferencias vs baseline
   * Compara escenario simulado con predicción base
   */
  const calculateDifference = () => {
    if (!activeScenario) return { valor: 0, costo: 0, emisiones: 0 };

    const baselineTotal = baselinePrediction
      .slice(0, params.mesesSimulacion)
      .reduce((sum, p) => sum + p.valor, 0);

    const scenarioTotal = activeScenario.data.reduce((sum, p) => sum + p.valorSimulado, 0);

    const diferencia = scenarioTotal - baselineTotal;
    const costoDiferencia = diferencia * params.precioKwh;
    const emisionesDiferencia = diferencia * params.factorEmision;

    return {
      valor: (diferencia / baselineTotal) * 100,
      costo: costoDiferencia,
      emisiones: emisionesDiferencia,
    };
  };

  const difference = calculateDifference();

  /**
   * Calcular ROI de inversión en eficiencia
   */
  const calculateROI = () => {
    if (!activeScenario || params.inversionEficiencia === 0) return null;

    const ahorroMensual = Math.abs(difference.costo) / params.mesesSimulacion;
    const mesesRecuperacion = params.inversionEficiencia / ahorroMensual;

    return {
      mesesRecuperacion: Math.round(mesesRecuperacion),
      roiAnual: ((ahorroMensual * 12) / params.inversionEficiencia) * 100,
    };
  };

  const roi = calculateROI();

  /**
   * Preparar datos para gráfico comparativo
   */
  const chartData = baselinePrediction.slice(0, params.mesesSimulacion).map((point, index) => ({
    fecha: point.fecha,
    baseline: point.valor,
    simulado: activeScenario?.data[index]?.valorSimulado || null,
  }));

  /**
   * Actualizar parámetro
   */
  const updateParam = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: parseFloat(value) }));
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Simulador de Escenarios</h3>
            <p className="text-sm text-gray-600">
              {municipio} • {params.mesesSimulacion} meses
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
          {activeScenario && (
            <Button variant="outline" size="sm" onClick={handleSaveScenario}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          )}
          <Button onClick={handleSimulate} disabled={isSimulating}>
            {isSimulating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Simulando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Simular
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de parámetros */}
        <div className="space-y-5">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Parámetros de Simulación
          </h4>

          {/* Reducción objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reducción/Aumento Objetivo
            </label>
            <Input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={params.reduccionObjetivo}
              onChange={(e) => updateParam('reduccionObjetivo', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">-50% (reducción)</span>
              <Badge variant={params.reduccionObjetivo >= 0 ? 'destructive' : 'default'}>
                {params.reduccionObjetivo > 0 ? '+' : ''}
                {params.reduccionObjetivo}%
              </Badge>
              <span className="text-xs text-gray-500">+50% (aumento)</span>
            </div>
          </div>

          {/* Eficiencia energética */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mejora de Eficiencia Energética
            </label>
            <Input
              type="range"
              min="0"
              max="50"
              step="1"
              value={params.eficienciaEnergetica}
              onChange={(e) => updateParam('eficienciaEnergetica', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">0%</span>
              <Badge className="bg-green-100 text-green-800">
                -{params.eficienciaEnergetica}% consumo
              </Badge>
              <span className="text-xs text-gray-500">50%</span>
            </div>
          </div>

          {/* Crecimiento poblacional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crecimiento Poblacional Anual
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={params.crecimientoPoblacional}
              onChange={(e) => updateParam('crecimientoPoblacional', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {params.crecimientoPoblacional}% anual (compuesto mensual)
            </p>
          </div>

          {/* Nueva infraestructura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Infraestructura (kWh/mes)
            </label>
            <Input
              type="number"
              step="1000"
              min="0"
              value={params.nuevaInfraestructura}
              onChange={(e) => updateParam('nuevaInfraestructura', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Consumo adicional proyectado</p>
          </div>

          {/* Meses de simulación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Simulación
            </label>
            <select
              value={params.mesesSimulacion}
              onChange={(e) => updateParam('mesesSimulacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Parámetros Económicos</h5>

            {/* Precio kWh */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio kWh (COP)
              </label>
              <Input
                type="number"
                step="50"
                min="0"
                value={params.precioKwh}
                onChange={(e) => updateParam('precioKwh', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Factor emisión */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factor Emisión (kg CO₂/kWh)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={params.factorEmision}
                onChange={(e) => updateParam('factorEmision', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Inversión eficiencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inversión en Eficiencia (COP)
              </label>
              <Input
                type="number"
                step="1000000"
                min="0"
                value={params.inversionEficiencia}
                onChange={(e) => updateParam('inversionEficiencia', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Panel de visualización */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico comparativo */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Comparación Baseline vs Simulado</h4>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(v) => formatNumber(v, 0)}
                />
                <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#3b82f6"
                  name="Baseline"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                {activeScenario && (
                  <Line
                    type="monotone"
                    dataKey="simulado"
                    stroke="#a855f7"
                    name="Simulado"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resultados de simulación */}
          {activeScenario && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-lg p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                Resultados de la Simulación
              </h4>

              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Cambio en consumo */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    {difference.valor > 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    )}
                    <p className="text-xs text-gray-600 font-medium">Cambio en Consumo</p>
                  </div>
                  <p
                    className={`text-3xl font-bold ${
                      difference.valor > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {difference.valor > 0 ? '+' : ''}
                    {formatNumber(difference.valor, 1)}%
                  </p>
                </div>

                {/* Impacto económico */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign
                      className={`w-5 h-5 ${
                        difference.costo > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    />
                    <p className="text-xs text-gray-600 font-medium">Impacto Económico</p>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      difference.costo > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    ${formatNumber(Math.abs(difference.costo), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {difference.costo > 0 ? 'Costo adicional' : 'Ahorro total'}
                  </p>
                </div>

                {/* Emisiones CO₂ */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf
                      className={`w-5 h-5 ${
                        difference.emisiones > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    />
                    <p className="text-xs text-gray-600 font-medium">Emisiones CO₂</p>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      difference.emisiones > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {difference.emisiones > 0 ? '+' : ''}
                    {formatNumber(Math.abs(difference.emisiones), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">kg CO₂ total</p>
                </div>
              </div>

              {/* ROI si hay inversión */}
              {roi && (
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Retorno de Inversión (ROI)</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Recuperación de inversión</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {roi.mesesRecuperacion} meses
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">ROI Anual</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatNumber(roi.roiAnual, 1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detalle de parámetros aplicados */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-3 text-sm">Parámetros Aplicados</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reducción objetivo:</span>
                    <span className="font-semibold">{params.reduccionObjetivo}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eficiencia:</span>
                    <span className="font-semibold">{params.eficienciaEnergetica}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crecimiento pob.:</span>
                    <span className="font-semibold">{params.crecimientoPoblacional}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nueva infraestructura:</span>
                    <span className="font-semibold">
                      {formatNumber(params.nuevaInfraestructura, 0)} kWh
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Escenarios guardados */}
          {scenarios.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Escenarios Guardados ({scenarios.length})
              </h4>
              <div className="space-y-2">
                {scenarios
                  .slice(-3)
                  .reverse()
                  .map((scenario, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScenario(scenario)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        activeScenario?.id === scenario.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{scenario.nombre}</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(scenario.createdAt).toLocaleTimeString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {scenario.params.mesesSimulacion} meses • Reducción:{' '}
                        {scenario.params.reduccionObjetivo}% • Eficiencia:{' '}
                        {scenario.params.eficienciaEnergetica}%
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ScenarioSimulator;
