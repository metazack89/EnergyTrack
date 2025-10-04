import { useState, useEffect } from 'react';

/**
 * Hook para manejar localStorage con React state
 * Sincroniza automáticamente los cambios con localStorage
 *
 * @param {string} key - Clave en localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, Function, Function]} [valor, setValor, removerValor]
 *
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', null)
 *
 * setUser({ name: 'Juan', email: 'juan@example.com' })
 * console.log(user) // { name: 'Juan', email: 'juan@example.com' }
 *
 * removeUser()
 * console.log(user) // null
 */
export const useLocalStorage = (key, initialValue) => {
  // Obtener valor inicial del localStorage
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Actualizar localStorage cuando cambia el valor
  const setValue = (value) => {
    try {
      // Permitir que value sea una función como en useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remover del localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Sincronizar entre pestañas/ventanas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
};
