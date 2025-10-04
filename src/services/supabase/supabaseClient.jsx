/**
 * Cliente de Supabase - Archivo de conveniencia
 * Re-exporta el cliente configurado desde config
 */

export { supabase, handleSupabaseError, checkSupabaseConnection } from '@/config/supabase.config';

// Exportar servicios para fácil acceso
export { authService } from './authService';
export { consumoService } from './consumoService';
export { municipioService } from './municipioService';
export { fuenteService } from './fuenteService';
export { prediccionService } from './prediccionService';
export { alertaService } from './alertaService';
export { profileService } from './profileService';
export { storageService } from './storageService';
