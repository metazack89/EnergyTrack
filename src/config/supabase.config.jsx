import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Faltan las credenciales de Supabase en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'energy-platform',
    },
  },
});

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);

  const errorMessages = {
    'Invalid login credentials': 'Credenciales inválidas',
    'User already registered': 'El usuario ya está registrado',
    'Email not confirmed': 'Por favor confirma tu email',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  };

  return (
    errorMessages[error.message] || error.message || 'Ha ocurrido un error. Intenta nuevamente.'
  );
};

// Helper para verificar la conexión
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').single();
    if (error) throw error;
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error);
    return false;
  }
};
