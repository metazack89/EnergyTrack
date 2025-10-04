import { cn } from '@/lib/utils';

/**
 * Componente Skeleton para estados de carga
 * Muestra placeholders animados mientras carga contenido
 *
 * @param {Object} props - Propiedades del skeleton
 * @param {string} [props.className] - Clases CSS adicionales
 *
 * @example
 * <Skeleton className="h-12 w-full" />
 * <Skeleton className="h-4 w-[250px]" />
 */
function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
}

/**
 * SkeletonCard - Skeleton para tarjetas
 * Placeholder pre-configurado para cards
 */
function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Skeleton para tablas
 */
function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
