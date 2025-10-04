import { supabase } from '@/config/supabase.config';

export const storageService = {
  // Subir archivo
  async uploadFile(bucket, filePath, file) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  },

  // Obtener URL pública
  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Descargar archivo
  async downloadFile(bucket, filePath) {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(filePath);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error downloading file:', error);
      return { data: null, error };
    }
  },

  // Eliminar archivo
  async deleteFile(bucket, filePath) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { error };
    }
  },

  // Listar archivos
  async listFiles(bucket, folder = '') {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error listing files:', error);
      return { data: null, error };
    }
  },
};
