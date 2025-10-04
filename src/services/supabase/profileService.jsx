import { supabase } from '@/config/supabase.config';

export const profileService = {
  // Obtener perfil por ID de usuario
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          *,
          departamentos:departamento_id (
            id,
            nombre,
            region
          )
        `
        )
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  },

  // Actualizar perfil
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  },

  // Subir avatar
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir archivo
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Actualizar perfil con nueva URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { data: null, error };
    }
  },

  // Obtener todos los perfiles (solo admin)
  async getAllProfiles(filters = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select(
          `
          *,
          departamentos:departamento_id (
            id,
            nombre
          )
        `
        )
        .order('created_at', { ascending: false });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.departamentoId) {
        query = query.eq('departamento_id', filters.departamentoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return { data: null, error };
    }
  },

  // Cambiar rol de usuario
  async changeRole(userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error changing role:', error);
      return { data: null, error };
    }
  },
};
