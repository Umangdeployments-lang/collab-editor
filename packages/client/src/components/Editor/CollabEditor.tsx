import React, { useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { useCollabEditor } from '../../hooks/useCollabEditor';
import { useAwareness } from '../../hooks/useAwareness';
import Toolbar from './Toolbar';
import UserPresence from './UserPresence';
import { documentsApi } from '../../lib/api';

interface CollabEditorProps {
  docId: string;
}

export default function CollabEditor({ docId }: CollabEditorProps) {
  const { editor, provider, isConnected, isSynced } = useCollabEditor(docId);
  const awarenessStates = useAwareness(provider);
  const [title, setTitle] = useState('Loading document...');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await documentsApi.get(docId);
        setTitle(res.data.title || 'Untitled Document');
      } catch (err) {
        console.error('Failed to fetch document', err);
      }
    }
    fetchDoc();
  }, [docId]);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== title) {
      setSaving(true);
      try {
        await documentsApi.updateTitle(docId, tempTitle);
        setTitle(tempTitle);
      } catch (err) {
        console.error('Failed to update title', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const connectionColor = isConnected ? (isSynced ? 'var(--color-success)' : '#eab308') : 'var(--color-danger)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connectionColor }} title={isConnected ? 'Connected' : 'Disconnected'} />
            {isEditingTitle ? (
              <input
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                style={{ fontSize: '1.125rem', fontWeight: 600, padding: '0.25rem', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-primary)', color: 'var(--color-text)', borderRadius: '4px', outline: 'none' }}
              />
            ) : (
              <h1 
                onClick={() => { setTempTitle(title); setIsEditingTitle(true); }}
                style={{ fontSize: '1.125rem', fontWeight: 600, cursor: 'text', margin: 0 }}
              >
                {title} {saving && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Saving...</span>}
              </h1>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UserPresence awarenessStates={awarenessStates} />
          <button style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Share
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Toolbar editor={editor} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--color-surface)', borderRadius: '8px', minHeight: '100%', border: '1px solid var(--color-border)' }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        <div>
          {editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0} words
        </div>
        <div>
          {isConnected ? (isSynced ? 'All changes saved to server' : 'Syncing...') : 'Offline'}
        </div>
      </div>
    </div>
  );
}
