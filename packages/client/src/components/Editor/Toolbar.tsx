import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Code, Highlighter 
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  const getButtonStyle = (isActive: boolean) => ({
    padding: '0.5rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
    color: isActive ? '#fff' : 'var(--color-text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const dividerStyle = {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--color-border)',
    margin: '0 0.5rem',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '0.25rem' }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} style={getButtonStyle(editor.isActive('bold'))}>
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} style={getButtonStyle(editor.isActive('italic'))}>
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={getButtonStyle(editor.isActive('underline'))}>
        <Underline size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} style={getButtonStyle(editor.isActive('strike'))}>
        <Strikethrough size={18} />
      </button>

      <div style={dividerStyle} />

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={getButtonStyle(editor.isActive('heading', { level: 1 }))}>
        <Heading1 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={getButtonStyle(editor.isActive('heading', { level: 2 }))}>
        <Heading2 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={getButtonStyle(editor.isActive('heading', { level: 3 }))}>
        <Heading3 size={18} />
      </button>

      <div style={dividerStyle} />

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={getButtonStyle(editor.isActive('bulletList'))}>
        <List size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={getButtonStyle(editor.isActive('orderedList'))}>
        <ListOrdered size={18} />
      </button>

      <div style={dividerStyle} />

      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={getButtonStyle(editor.isActive('codeBlock'))}>
        <Code size={18} />
      </button>
      
      <div style={dividerStyle} />
      
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} style={getButtonStyle(editor.isActive('highlight'))}>
        <Highlighter size={18} />
      </button>
    </div>
  );
}
