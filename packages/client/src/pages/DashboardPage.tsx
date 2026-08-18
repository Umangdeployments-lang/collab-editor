import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentList from '../components/Dashboard/DocumentList';
import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <DocumentList />;
}
