import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-2 flex flex-wrap gap-2">
      {/* Undo/Redo */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().undo().run();
        }}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <span className="material-symbols-outlined text-lg">undo</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().redo().run();
        }}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        <span className="material-symbols-outlined text-lg">redo</span>
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Text Formatting */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive('bold') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleItalic().run();
        }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive('italic') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('underline') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleStrike().run();
        }}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive('strike') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Headings */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Heading 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().setParagraph().run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('paragraph') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Paragraph"
      >
        P
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Lists */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Numbered List"
      >
        1. List
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Align Left"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Align Center"
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Align Right"
      >
        →
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Blockquote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Blockquote"
      >
        "
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          editor.isActive('code') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Inline Code"
      >
        {'</>'}
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('codeBlock') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Code Block"
      >
        {'{ }'}
      </button>
      <div className="w-px h-6 mx-1 bg-gray-200 self-center" />

      {/* Link */}
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
          editor.isActive('link') ? 'bg-gray-100 text-gray-900' : ''
        }`}
        title="Add/Edit Link"
      >
        Link
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }) {
  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-disc pl-0',
        },
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-decimal pl-0',
        },
      },
      listItem: {
        HTMLAttributes: {
          class: 'list-item pl-0 ml-5',
        },
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-red-600 hover:text-red-700 underline',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
    }),
    Placeholder.configure({
      placeholder: placeholder || 'Write something...',
      emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0',
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'listItem'],
    }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 focus:outline-none prose-p:mb-4 prose-p:text-sm prose-p:pl-0 prose-headings:font-semibold prose-h2:mb-4 prose-h2:text-2xl prose-h3:mb-2 prose-h3:text-xl prose-a:text-red-600 hover:prose-a:text-red-700 prose-ul:list-disc prose-ul:pl-0 prose-ul:my-4 prose-ul:marker:text-gray-600 prose-ol:list-decimal prose-ol:pl-0 prose-ol:my-4 prose-ol:marker:text-gray-600 prose-li:my-2 prose-li:pl-0 prose-li:ml-5 prose-li:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-code:text-red-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-img:rounded-lg',
      },
    },
  });

  // Update editor content when content prop changes (for edit forms)
  useEffect(() => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    const newContent = content || '';
    
    // Only update if content actually changed to avoid unnecessary re-renders
    if (newContent !== currentContent && newContent !== '<p></p>') {
      editor.commands.setContent(newContent, false);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="bg-white rounded-lg min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <MenuBar editor={editor} />
      <div className="min-h-[500px] max-h-[800px] overflow-y-auto">
        <EditorContent 
          editor={editor} 
        />
      </div>
    </div>
  );
}
