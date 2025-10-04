import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/config/supabase.config';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
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

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, departamentoId = null) => {
    try {
      setLoading(true);

      // Crear usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            departamento_id: departamentoId,
          },
        },
      });

      if (error) throw error;

      toast.success('¡Cuenta creada exitosamente! Por favor verifica tu email.');
      navigate('/login');

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setProfile(null);
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Perfil actualizado exitosamente');

      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
      return { data: null, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Revisa tu email para restablecer tu contraseña');
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error al enviar email de recuperación');
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Contraseña actualizada exitosamente');
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error al actualizar la contraseña');
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,

    // Helpers
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isGestor: profile?.role === 'gestor' || profile?.role === 'admin',
    canEdit: profile?.role === 'gestor' || profile?.role === 'admin',
    canDelete: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
