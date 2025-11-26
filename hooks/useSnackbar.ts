
'use client';

import { useContext } from 'react';
import { SnackbarContext } from '@/components/ui/Snackbar'; // Corrected import path

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
