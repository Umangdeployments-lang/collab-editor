import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import useAuthStore from '../store/authStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>CollabEdit</h1>
        
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '6px', backgroundColor: 'var(--color-surface-2)', padding: '0.25rem' }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: '4px', backgroundColor: isLogin ? 'var(--color-primary)' : 'transparent', color: isLogin ? '#fff' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: '4px', backgroundColor: !isLogin ? 'var(--color-primary)' : 'transparent', color: !isLogin ? '#fff' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
          >
            Register
          </button>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
