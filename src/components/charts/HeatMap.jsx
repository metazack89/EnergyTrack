import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @typedef {Object} HeatMapProps
 * @property {Array<Object>} data - Datos [{x, y, value}]
 * @property {string} [title] - Título del gráfico
 * @property {Array<string>} [xLabels] - Etiquetas eje X
 * @property {Array<string>} [yLabels] - Etiquetas eje Y
 * @property {Array<string>} [colors] - Gradiente de colores
 * @property {string} [unit] - Unidad de medida
 */

const HeatMap = ({
  data = [],
  title,
  xLabels = [],
  yLabels = [],
  colors = ['#dcfce7', '#86efac', '#22c55e', '#16a34a', '#166534'],
  unit = '',
}) => {
  const { matrix, min, max } = useMemo(() => {
    if (!data.length) return { matrix: [], min: 0, max: 0 };

    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Organizar datos en matriz
    const matrixData = [];
    const xSet = new Set(data.map((d) => d.x));
    const ySet = new Set(data.map((d) => d.y));

    Array.from(ySet).forEach((y) => {
      const row = [];
      Array.from(xSet).forEach((x) => {
        const point = data.find((d) => d.x === x && d.y === y);
        row.push(point ? point.value : 0);
      });
      matrixData.push(row);
    });

    return { matrix: matrixData, min: minVal, max: maxVal };
  }, [data]);

  const getColor = (value) => {
    if (value === 0) return '#f3f4f6';
    const percentage = (value - min) / (max - min);
    const index = Math.floor(percentage * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
  };

  if (!data.length) {
    return (
      <Card className="p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-400">
          Sin datos disponibles
        </div>
      </Card>
    );
  }

  const cellSize = 40;
  const xAxisLabels = xLabels.length ? xLabels : [...new Set(data.map((d) => d.x))];
  const yAxisLabels = yLabels.length ? yLabels : [...new Set(data.map((d) => d.y))];

  return (
    <Card className="p-6">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Bajo</span>
            <div className="flex gap-1">
              {colors.map((color, i) => (
                <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
              ))}
            </div>
            <span className="text-xs text-gray-600">Alto</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Espacio para etiquetas Y */}
            <div className="flex flex-col justify-end" style={{ width: '100px' }}>
              <div style={{ height: cellSize }}></div>
              {yAxisLabels.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center justify-end pr-2 text-xs text-gray-600"
                  style={{ height: cellSize }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid del mapa de calor */}
            <div>
              {/* Etiquetas X */}
              <div className="flex" style={{ height: cellSize }}>
                {xAxisLabels.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-xs text-gray-600"
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <span className="transform -rotate-45 origin-center">{label}</span>
                  </div>
                ))}
              </div>

              {/* Celdas del mapa */}
              {matrix.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((value, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="border border-white relative group cursor-pointer transition-transform hover:scale-110"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: getColor(value),
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {xAxisLabels[x]} - {yAxisLabels[y]}
                          <br />
                          {formatNumber(value, 0)} {unit}
                        </div>
                      </div>

                      {/* Valor en celda */}
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                        {value > 0 && formatNumber(value, 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
        <span>
          Rango: {formatNumber(min, 0)} - {formatNumber(max, 0)} {unit}
        </span>
        <span>Puntos: {data.length}</span>
      </div>
    </Card>
  );
};

export default HeatMap;
