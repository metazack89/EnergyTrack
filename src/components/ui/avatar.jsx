import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

/**
 * Avatar Root - Contenedor principal
 */
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Avatar Image - Imagen del avatar
 */
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Avatar Fallback - Fallback cuando no hay imagen
 *
 * @example
 * <Avatar>
 *   <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
 *   <AvatarFallback>CN</AvatarFallback>
 * </Avatar>
 */
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Avatar con iniciales - Componente compuesto
 * Genera iniciales automáticamente desde el nombre
 *
 * @param {Object} props
 * @param {string} [props.name] - Nombre completo
 * @param {string} [props.src] - URL de la imagen
 * @param {string} [props.size] - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 *
 * @example
 * <AvatarWithInitials name="John Doe" size="lg" />
 * <AvatarWithInitials src="url.jpg" name="John Doe" />
 */
const AvatarWithInitials = ({ name = '', src, size = 'md', className }) => {
  /**
   * Generar iniciales desde el nombre
   */
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};

export { Avatar, AvatarImage, AvatarFallback, AvatarWithInitials };
