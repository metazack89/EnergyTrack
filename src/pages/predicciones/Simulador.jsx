import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useConsumos, useMunicipios } from '@/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Brain,
  ArrowLeft,
  Play,
  RotateCcw,
  Zap,
  Info,
  CheckCircle2,
  MapPin,
  Settings,
  Target,
  DollarSign,
  Leaf,
  Users,
  Building2,
  Lightbulb,
  Download,
  Calculator,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import { predictorService } from '@/services/ml/predictor';
import toast from 'react-hot-toast';

const Simulador = () => {
  const { consumos } = useConsumos();
  const { municipios } = useMunicipios();

  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [escenarios, setEscenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vistaActual, setVistaActual] = useState('configuracion');

  const [parametros, setParametros] = useState({
    reduccionObjetivo: 0,
    eficienciaEnergetica: 0,
    crecimientoPoblacional: 0,
    nuevaInfraestructura: 0,
    mesesSimulacion: 12,
    precioKwh: 500,
    factorEmision: 0.5,
    inversionEficiencia: 0,
  });

  const [baseline, setBaseline] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [comparativa, setComparativa] = useState(null);
  const [impactoEconomico, setImpactoEconomico] = useState(null);
  const [impactoAmbiental, setImpactoAmbiental] = useState(null);

  const presets = [
    {
      nombre: 'Eficiencia Agresiva',
      icon: Zap,
      color: 'green',
      params: {
        reduccionObjetivo: -30,
        eficienciaEnergetica: 40,
        crecimientoPoblacional: 1,
        nuevaInfraestructura: 0,
      },
    },
    {
      nombre: 'Crecimiento Urbano',
      icon: Building2,
      color: 'orange',
      params: {
        reduccionObjetivo: 0,
        eficienciaEnergetica: 10,
        crecimientoPoblacional: 5,
        nuevaInfraestructura: 5000,
      },
    },
    {
      nombre: 'Transición Verde',
      icon: Leaf,
      color: 'emerald',
      params: {
        reduccionObjetivo: -20,
        eficienciaEnergetica: 30,
        crecimientoPoblacional: 2,
        nuevaInfraestructura: 0,
      },
    },
    {
      nombre: 'Status Quo',
      icon: Target,
      color: 'gray',
      params: {
        reduccionObjetivo: 0,
        eficienciaEnergetica: 0,
        crecimientoPoblacional: 1.5,
        nuevaInfraestructura: 0,
      },
    },
  ];

  useEffect(() => {
    if (selectedMunicipio && consumos.length > 0) calcularBaseline();
  }, [selectedMunicipio]);

  const calcularBaseline = () => {
    const consumosMunicipio = consumos
      .filter((c) => c.municipio_id === parseInt(selectedMunicipio))
      .sort((a, b) => new Date(a.anio, a.mes - 1) - new Date(b.anio, b.mes - 1));

    if (consumosMunicipio.length < 6) return toast.error('Se necesitan al menos 6 meses de datos');

    const consumosPorMes = {};
    consumosMunicipio.forEach((c) => {
      const key = `${c.anio}-${String(c.mes).padStart(2, '0')}`;
      consumosPorMes[key] = (consumosPorMes[key] || 0) + Number(c.valor_kwh);
    });

    const valores = Object.values(consumosPorMes);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    setBaseline({ valores, promedio, meses: valores.length });
  };

  const simularEscenarios = () => {
    if (!baseline) return toast.error('Selecciona un municipio primero');

    try {
      setLoading(true);
      const prediccionBase = predictorService.predecirConsumo(
        baseline.valores,
        parseInt(parametros.mesesSimulacion)
      );

      const factorReduccion = 1 + parametros.reduccionObjetivo / 100;
      const factorEficiencia = 1 - parametros.eficienciaEnergetica / 100;
      const factorCrecimiento = 1 + parametros.crecimientoPoblacional / 100 / 12;
      const factorInfraestructura = parametros.nuevaInfraestructura / parametros.mesesSimulacion;

      const nuevosEscenarios = [
        { nombre: 'Base', datos: prediccionBase, color: '#3b82f6', tipo: 'base' },
        {
          nombre: 'Optimista',
          datos: prediccionBase.map((p, i) => ({
            ...p,
            valor: p.valor * Math.pow(factorEficiencia, i + 1) * factorReduccion,
          })),
          color: '#10b981',
          tipo: 'optimista',
        },
        {
          nombre: 'Conservador',
          datos: prediccionBase.map((p, i) => ({
            ...p,
            valor: p.valor * Math.pow(factorCrecimiento, i + 1),
          })),
          color: '#f59e0b',
          tipo: 'conservador',
        },
        {
          nombre: 'Pesimista',
          datos: prediccionBase.map((p, i) => ({
            ...p,
            valor:
              p.valor * Math.pow(factorCrecimiento * 1.5, i + 1) + factorInfraestructura * (i + 1),
          })),
          color: '#ef4444',
          tipo: 'pesimista',
        },
        {
          nombre: 'Personalizado',
          datos: prediccionBase.map((p, i) => {
            let valor =
              p.valor *
              Math.pow(factorReduccion, i + 1) *
              Math.pow(factorEficiencia, i + 1) *
              Math.pow(factorCrecimiento, i + 1);
            return { ...p, valor: Math.max(0, valor + factorInfraestructura * (i + 1)) };
          }),
          color: '#8b5cf6',
          tipo: 'personalizado',
        },
      ];

      setEscenarios(nuevosEscenarios);
      prepararChartData(nuevosEscenarios);
      calcularComparativa(nuevosEscenarios);
      calcularImpactoEconomico(nuevosEscenarios);
      calcularImpactoAmbiental(nuevosEscenarios);
      setVistaActual('resultados');
      toast.success('Simulación completada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al simular');
    } finally {
      setLoading(false);
    }
  };

  const prepararChartData = (escenariosData) => {
    const data = [];
    for (let i = 0; i < parseInt(parametros.mesesSimulacion); i++) {
      const item = { mes: `Mes ${i + 1}`, promedio: baseline.promedio };
      escenariosData.forEach(
        (escenario) => (item[escenario.tipo] = escenario.datos[i]?.valor || 0)
      );
      data.push(item);
    }
    setChartData(data);
  };

  const calcularComparativa = (escenariosData) => {
    setComparativa(
      escenariosData.map((escenario) => {
        const total = escenario.datos.reduce((sum, d) => sum + d.valor, 0);
        const promedio = total / escenario.datos.length;
        return {
          nombre: escenario.nombre,
          tipo: escenario.tipo,
          color: escenario.color,
          total,
          promedio,
          variacionVsBaseline: ((promedio - baseline.promedio) / baseline.promedio) * 100,
          ahorroEstimado: (baseline.promedio - promedio) * parametros.mesesSimulacion,
        };
      })
    );
  };

  const calcularImpactoEconomico = (escenariosData) => {
    setImpactoEconomico(
      escenariosData.map((escenario) => {
        const total = escenario.datos.reduce((sum, d) => sum + d.valor, 0);
        const costoTotal = total * parametros.precioKwh;
        const costoBaseline = baseline.promedio * parametros.mesesSimulacion * parametros.precioKwh;
        const ahorro = costoBaseline - costoTotal;
        return {
          tipo: escenario.tipo,
          nombre: escenario.nombre,
          costoTotal,
          ahorro,
          ahorroAnual: (ahorro / parametros.mesesSimulacion) * 12,
        };
      })
    );
  };

  const calcularImpactoAmbiental = (escenariosData) => {
    setImpactoAmbiental(
      escenariosData.map((escenario) => {
        const total = escenario.datos.reduce((sum, d) => sum + d.valor, 0);
        const emisionesCO2 = total * parametros.factorEmision;
        const emisionesBaseline =
          baseline.promedio * parametros.mesesSimulacion * parametros.factorEmision;
        const reduccionEmisiones = emisionesBaseline - emisionesCO2;
        return {
          tipo: escenario.tipo,
          nombre: escenario.nombre,
          emisionesCO2,
          reduccionEmisiones,
          arbolesEquivalentes: Math.max(0, reduccionEmisiones / 21),
        };
      })
    );
  };

  const resetParametros = () => {
    setParametros({
      reduccionObjetivo: 0,
      eficienciaEnergetica: 0,
      crecimientoPoblacional: 0,
      nuevaInfraestructura: 0,
      mesesSimulacion: 12,
      precioKwh: 500,
      factorEmision: 0.5,
      inversionEficiencia: 0,
    });
    setEscenarios([]);
    setVistaActual('configuracion');
    toast.success('Parámetros restablecidos');
  };

  const handleParametroChange = (e) => {
    const { name, value } = e.target;
    setParametros((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const exportarResultados = () => {
    if (!comparativa) return;
    const csv = [
      [
        'Escenario',
        'Total (kWh)',
        'Promedio (kWh)',
        'Variación (%)',
        'Ahorro (kWh)',
        'Costo (COP)',
      ],
      ...comparativa.map((comp, i) => [
        comp.nombre,
        comp.total.toFixed(2),
        comp.promedio.toFixed(2),
        comp.variacionVsBaseline.toFixed(2),
        comp.ahorroEstimado.toFixed(2),
        impactoEconomico?.[i]?.costoTotal.toFixed(2) || '0',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulacion-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/predicciones">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary-600" />
              Simulador de Escenarios
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis predictivo con impacto económico y ambiental
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              ML Avanzado
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-green-50 text-green-700">
              <Leaf className="w-4 h-4 mr-2" />
              Eco-Friendly
            </Badge>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {vistaActual === 'configuracion' ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Municipio
                </h3>
                <Select
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                  className="w-full"
                >
                  <option value="">Seleccionar...</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Select>
                {baseline && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Baseline</p>
                    <p className="text-xs text-blue-800">
                      Promedio: {formatNumber(baseline.promedio, 0)} kWh/mes ({baseline.meses}{' '}
                      meses)
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Presets
                </h3>
                <div className="grid gap-3">
                  {presets.map((preset, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => {
                        setParametros((prev) => ({ ...prev, ...preset.params }));
                        toast.success(`${preset.nombre} aplicado`);
                      }}
                      className="justify-start text-left"
                    >
                      <preset.icon className={`w-4 h-4 mr-2 text-${preset.color}-600`} />
                      <span className="font-medium">{preset.nombre}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-600" />
                  Parámetros
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: 'reduccionObjetivo',
                      label: 'Reducción (%)',
                      icon: Zap,
                      min: -50,
                      max: 50,
                      step: 0.5,
                    },
                    {
                      name: 'eficienciaEnergetica',
                      label: 'Eficiencia (%)',
                      icon: Zap,
                      min: 0,
                      max: 50,
                      step: 1,
                    },
                    {
                      name: 'crecimientoPoblacional',
                      label: 'Crecimiento (%/año)',
                      icon: Users,
                      min: 0,
                      max: 10,
                      step: 0.1,
                    },
                    {
                      name: 'nuevaInfraestructura',
                      label: 'Infraestructura (kWh)',
                      icon: Building2,
                      min: 0,
                      max: 10000,
                      step: 100,
                    },
                    {
                      name: 'precioKwh',
                      label: 'Precio kWh (COP)',
                      icon: DollarSign,
                      min: 0,
                      step: 10,
                    },
                    {
                      name: 'factorEmision',
                      label: 'Factor CO₂ (kg/kWh)',
                      icon: Leaf,
                      min: 0,
                      max: 1,
                      step: 0.01,
                    },
                    {
                      name: 'inversionEficiencia',
                      label: 'Inversión (COP)',
                      icon: Calculator,
                      min: 0,
                      step: 1000000,
                    },
                  ].map((param) => (
                    <div key={param.name}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {param.label}
                      </label>
                      <Input
                        type="number"
                        name={param.name}
                        value={parametros[param.name]}
                        onChange={handleParametroChange}
                        step={param.step}
                        min={param.min}
                        max={param.max}
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Meses</label>
                    <Select
                      name="mesesSimulacion"
                      value={parametros.mesesSimulacion}
                      onChange={handleParametroChange}
                    >
                      {[6, 12, 24, 36].map((m) => (
                        <option key={m} value={m}>
                          {m} meses
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={simularEscenarios}
                    disabled={!baseline || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Simulando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Ejecutar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetParametros} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restablecer
                  </Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-12 text-center">
                <Calculator className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Listo para Simular</h3>
                <p className="text-gray-600">Configura parámetros y ejecuta la simulación</p>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Simulación completada - {escenarios.length} escenarios
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVistaActual('configuracion')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ajustar
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportarResultados}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comparación de Escenarios</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    {escenarios.map((e) => (
                      <linearGradient
                        key={e.tipo}
                        id={`color-${e.tipo}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={e.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={e.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(v) => formatNumber(v, 0)}
                  />
                  <Tooltip formatter={(value) => formatNumber(value, 0) + ' kWh'} />
                  <Legend />
                  <ReferenceLine
                    y={baseline.promedio}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label={{ value: 'Baseline', position: 'right' }}
                  />
                  {escenarios.map((e) => (
                    <Area
                      key={e.tipo}
                      type="monotone"
                      dataKey={e.tipo}
                      stroke={e.color}
                      strokeWidth={2}
                      fill={`url(#color-${e.tipo})`}
                      name={e.nombre}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {comparativa && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparativa.map((comp, i) => {
                  const eco = impactoEconomico?.[i];
                  const amb = impactoAmbiental?.[i];
                  return (
                    <Card
                      key={i}
                      className={`p-6 ${
                        comp.tipo === 'personalizado' ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{comp.nombre}</h4>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: comp.color }}
                        ></div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Promedio</span>
                          <span className="font-semibold">
                            {formatNumber(comp.promedio, 0)} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">vs Baseline</span>
                          <Badge
                            className={
                              comp.variacionVsBaseline > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {comp.variacionVsBaseline > 0 ? '+' : ''}
                            {formatNumber(comp.variacionVsBaseline, 1)}%
                          </Badge>
                        </div>
                        {eco && (
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-gray-600">Ahorro</span>
                            <span
                              className={`font-semibold ${
                                eco.ahorro > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              ${formatNumber(Math.abs(eco.ahorro), 0)}
                            </span>
                          </div>
                        )}
                        {amb && amb.arbolesEquivalentes > 0 && (
                          <div className="pt-2 border-t text-center text-xs text-green-800 bg-green-50 p-2 rounded">
                            🌳 {Math.round(amb.arbolesEquivalentes)} árboles equivalentes
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Simulador;
