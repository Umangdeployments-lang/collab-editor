import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CollabEditor from '../components/Editor/CollabEditor';
import useAuthStore from '../store/authStore';

export default function EditorPage() {
  const { docId } = useParams<{ docId: string }>();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user || !docId) {
    return null;
  }

  return <CollabEditor docId={docId} />;
}
