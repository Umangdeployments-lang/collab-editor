import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import useAuthStore from '../store/authStore';

export function useCollabEditor(docId: string) {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const provider = useMemo(() => {
    const token = localStorage.getItem('accessToken') || '';
    return new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:1234',
      name: docId,
      document: ydoc,
      token,
    });
  }, [docId, ydoc]);

  useEffect(() => {
    const persistence = new IndexeddbPersistence(docId, ydoc);

    provider.on('connect', () => setIsConnected(true));
    provider.on('disconnect', () => setIsConnected(false));
    provider.on('synced', () => setIsSynced(true));

    return () => {
      provider.destroy();
    };
  }, [provider, docId, ydoc]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Highlight,
      Link.configure({ autolink: true, openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user?.name || 'Anonymous',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          id: user?.id,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose',
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return { editor, provider, ydoc, isConnected, isSynced };
}
