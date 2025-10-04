import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { EmptyState, Pagination, SearchBar } from '@/components/shared';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} Column
 * @property {string} key - Key del dato en el objeto
 * @property {string} label - Título de la columna
 * @property {boolean} [sortable] - Si la columna es ordenable
 * @property {Function} [render] - Función custom para renderizar celda
 * @property {string} [align] - Alineación: 'left' | 'center' | 'right'
 */

/**
 * @typedef {Object} DataTableProps
 * @property {Array<Object>} data - Datos a mostrar
 * @property {Array<Column>} columns - Configuración de columnas
 * @property {boolean} [loading] - Estado de carga
 * @property {string} [emptyMessage] - Mensaje cuando no hay datos
 * @property {boolean} [showSearch] - Mostrar barra de búsqueda
 * @property {boolean} [showPagination] - Mostrar paginación
 * @property {number} [pageSize] - Items por página
 * @property {Array<Object>} [actions] - Acciones por fila
 * @property {Function} [onRowClick] - Callback al hacer click en fila
 */

/**
 * Componente de tabla genérica y reutilizable
 * Incluye ordenamiento, búsqueda, paginación y acciones
 *
 * @param {DataTableProps} props - Propiedades del componente
 * @example
 * <DataTable
 *   data={consumos}
 *   columns={[
 *     { key: 'fecha', label: 'Fecha', sortable: true },
 *     { key: 'valor', label: 'Consumo (kWh)', sortable: true }
 *   ]}
 *   actions={[
 *     { label: 'Ver', icon: Eye, onClick: handleView },
 *     { label: 'Eliminar', icon: Trash2, onClick: handleDelete, variant: 'danger' }
 *   ]}
 * />
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  showSearch = true,
  showPagination = true,
  pageSize: initialPageSize = 10,
  actions = [],
  onRowClick,
}) => {
  // ========================================
  // ESTADOS
  // ========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // ========================================
  // FILTRADO Y BÚSQUEDA
  // ========================================

  /**
   * Filtrar datos por búsqueda
   * Busca en todas las columnas del objeto
   */
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;

    return columns.some((column) => {
      const value = item[column.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  // ========================================
  // ORDENAMIENTO
  // ========================================

  /**
   * Ordenar datos según configuración actual
   */
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Manejar valores nulos
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Comparar valores
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * Cambiar ordenamiento de columna
   */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  /**
   * Obtener icono de ordenamiento para columna
   */
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };

  // ========================================
  // PAGINACIÓN
  // ========================================

  /**
   * Calcular datos de la página actual
   */
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / pageSize);

  /**
   * Resetear a página 1 cuando cambian los filtros
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* ===== HEADER CON BÚSQUEDA ===== */}
      {showSearch && (
        <div className="p-4 border-b bg-gray-50">
          <SearchBar onSearch={handleSearch} placeholder="Buscar en la tabla..." />
        </div>
      )}

      {/* ===== TABLA ===== */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-12">
                  <EmptyState
                    type="no-results"
                    title="No se encontraron resultados"
                    description={searchQuery ? 'Intenta ajustar tu búsqueda' : emptyMessage}
                    showIcon={true}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {/* Render custom o valor por defecto */}
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}

                  {/* Columna de acciones */}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === rowIndex ? null : rowIndex);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Dropdown de acciones */}
                        {activeDropdown === rowIndex && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            {actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                  actionIndex === 0 ? 'rounded-t-lg' : ''
                                } ${actionIndex === actions.length - 1 ? 'rounded-b-lg' : ''} ${
                                  action.variant === 'danger'
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-gray-700'
                                }`}
                              >
                                <action.icon className="w-4 h-4" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINACIÓN ===== */}
      {showPagination && paginatedData.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </Card>
  );
};

export default DataTable;
