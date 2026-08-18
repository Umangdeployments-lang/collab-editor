import React, { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadUser = useAuthStore((state) => state.loadUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
