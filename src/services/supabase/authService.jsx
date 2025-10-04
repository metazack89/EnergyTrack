import { supabase, handleSupabaseError } from '@/config/supabase.config';

export const authService = {
  // Obtener sesión actual
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error: handleSupabaseError(error) };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: handleSupabaseError(error) };
    }
  },

  // Login con email y password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Registro de nuevo usuario
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  },

  // Recuperar contraseña
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  },

  // Actualizar contraseña
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Actualizar email
  async updateEmail(newEmail) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Verificar si el email existe
  async checkEmailExists(email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      return { exists: !!data, error: null };
    } catch (error) {
      return { exists: false, error: null };
    }
  },
};
