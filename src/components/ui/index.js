/**
 * ============================================
 * COMPONENTES UI BASE (shadcn/ui)
 * ============================================
 *
 * Sistema completo de componentes UI primitivos
 * Basados en Radix UI con estilos personalizados
 *
 * @module components/ui
 */

// ========================================
// COMPONENTES DE FORMULARIO
// ========================================
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export { Select } from './select';
export { Switch } from './switch';

// ========================================
// COMPONENTES DE LAYOUT
// ========================================
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';

export { Separator } from './separator';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

// ========================================
// COMPONENTES DE NAVEGACIÓN
// ========================================
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from './dropdown-menu';

// ========================================
// COMPONENTES DE FEEDBACK
// ========================================
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Badge, badgeVariants } from './badge';
export { Skeleton, SkeletonCard, SkeletonTable } from './skeleton';
export { Progress, ProgressCircular } from './progress';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

// ========================================
// COMPONENTES DE OVERLAY
// ========================================
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// ========================================
// COMPONENTES DE DATOS
// ========================================
export { Avatar, AvatarImage, AvatarFallback, AvatarWithInitials } from './avatar';
