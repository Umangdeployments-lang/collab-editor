import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../../lib/api';
import DocumentCard from './DocumentCard';
import useAuthStore from '../../store/authStore';

interface Doc {
  id: string;
  title: string;
  updatedAt: string;
  owner: { name: string };
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentsApi.list();
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const res = await documentsApi.create('Untitled Document');
      navigate(`/editor/${res.data.id}`);
    } catch (error) {
      console.error('Failed to create document', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>CollabEdit</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Hello, {user?.name}</span>
          <button
            onClick={handleCreateDocument}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}
          >
            New Document
          </button>
          <button
            onClick={logout}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 500, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Your Documents</h2>
        
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', height: '160px', animation: 'pulse 1.5s infinite', opacity: 0.6 }} />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDeleteDocument} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
            <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--color-surface-2)', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📄</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No documents yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>Create your first document to start collaborating with others.</p>
            <button
              onClick={handleCreateDocument}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Create New Document
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
