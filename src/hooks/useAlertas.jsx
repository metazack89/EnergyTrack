import { useContext } from 'react';
import { AlertContext } from '@/context/AlertContext';

export const useAlertas = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlertas debe usarse dentro de AlertProvider');
  }

  return context;
};
