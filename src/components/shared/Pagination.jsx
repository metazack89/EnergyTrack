import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * @typedef {Object} PaginationProps
 * @property {number} currentPage - Página actual (1-indexed)
 * @property {number} totalPages - Total de páginas
 * @property {number} totalItems - Total de items
 * @property {number} [pageSize] - Items por página
 * @property {Function} onPageChange - Callback al cambiar de página
 * @property {Function} [onPageSizeChange] - Callback al cambiar tamaño de página
 * @property {boolean} [showPageSize] - Mostrar selector de tamaño
 * @property {Array<number>} [pageSizeOptions] - Opciones de tamaño de página
 */

/**
 * Componente de paginación completo
 * Incluye navegación por páginas y selector de items por página
 *
 * @param {PaginationProps} props - Propiedades del componente
 * @example
 * <Pagination
 *   currentPage={page}
 *   totalPages={Math.ceil(totalItems / pageSize)}
 *   totalItems={totalItems}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  /**
   * Calcular rango de items mostrados
   */
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  /**
   * Generar array de números de página a mostrar
   * Muestra máximo 7 páginas: [1] ... [4] [5] [6] ... [10]
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      if (currentPage <= 3) {
        // Inicio: [1] [2] [3] [4] ... [10]
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: [1] ... [7] [8] [9] [10]
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Medio: [1] ... [4] [5] [6] ... [10]
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  /**
   * Deshabilitar navegación en los extremos
   */
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Info de items */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{startItem}</span> a{' '}
        <span className="font-semibold">{endItem}</span> de{' '}
        <span className="font-semibold">{totalItems}</span> resultados
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Selector de tamaño de página */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items por página:</span>
            <Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-20"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            aria-label="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Números de página */}
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[2.5rem]"
              >
                {page}
              </Button>
            )
          )}

          {/* Página siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            aria-label="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
