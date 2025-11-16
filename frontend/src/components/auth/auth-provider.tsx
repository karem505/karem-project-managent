/**
 * Authentication Provider Component
 */
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoadingPage } from '@/components/ui/loading';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};
