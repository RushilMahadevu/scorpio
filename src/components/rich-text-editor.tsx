import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Undo, 
  Redo,
  Quote,
  Strikethrough
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({ 
  isActive, 
  onClick, 
  onMouseDown,
  children, 
  disabled,
  title
}: { 
  isActive?: boolean; 
  onClick?: () => void; 
  onMouseDown?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[32px] group relative transition-all">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        onMouseDown={onMouseDown}
        title={title}
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200 disabled:opacity-30 border cursor-pointer",
          isActive 
            ? "bg-zinc-900 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-white shadow-lg scale-[1.05] z-10" 
            : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent border-transparent"
        )}
      >
        {children}
      </button>
      <div 
        className={cn(
          "h-[1.5px] rounded-full transition-all duration-300 transform origin-center",
          isActive ? "bg-zinc-900 dark:bg-zinc-100 w-4 opacity-100 scale-100" : "bg-zinc-500/20 dark:bg-zinc-700/20 w-1 opacity-0 scale-0"
        )}
      />
    </div>
  );
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const isInternalUpdate = useRef(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Research notes start here...',
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!isInternalUpdate.current) {
        isInternalUpdate.current = true;
        onChange(editor.getHTML());
        // Wait longer for the parent state to cycle through HTML -> MD -> MD -> HTML
        setTimeout(() => {
          isInternalUpdate.current = false;
        }, 200);
      }
    },
    onTransaction: ({ editor }) => {
      const active = [];
      if (editor.isActive('bold')) active.push('Bold');
      if (editor.isActive('italic')) active.push('Italic');
      if (editor.isActive('underline')) active.push('Underline');
      if (editor.isActive('strike')) active.push('Strikethrough');
      if (editor.isActive('heading', { level: 1 })) active.push('H1');
      if (editor.isActive('heading', { level: 2 })) active.push('H2');
      if (editor.isActive('blockquote')) active.push('Quote');
      if (editor.isActive('bulletList')) active.push('Bullets');
      if (editor.isActive('orderedList')) active.push('Numbered');
      
      // Only update state if the array has actually changed to avoid cycles
      if (JSON.stringify(active) !== JSON.stringify(activeFormats)) {
        setActiveFormats(active);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-zinc-900 dark:text-zinc-200 transition-colors selection:bg-zinc-200 dark:selection:bg-zinc-800',
      },
    },
  });

  // Keep the editor content in sync with external changes (e.g., Firestore sync)
  useEffect(() => {
    if (editor && !isInternalUpdate.current) {
      const currentHtml = editor.getHTML();
      // Only set content if it's genuinely different to avoid cursor jumps or reset marks
      if (content !== currentHtml) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(content, false);
        try {
          editor.commands.setTextSelection({ from, to });
        } catch (e) {
          // Range might be invalid after external update
        }
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Purely Dynamic States (Neutral)
  return (
    <div className="flex flex-col w-full h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      {/* TOOLBAR */}
      <div className="p-1 px-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/90 dark:bg-zinc-900/80 flex flex-wrap items-center gap-1.5 sticky top-0 z-10 backdrop-blur-2xl transition-colors shadow-sm">
        <div className="flex items-center gap-1.5 py-1.5">
          <ToolbarButton
            isActive={activeFormats.includes('Bold')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('Italic')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('Underline')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('Strikethrough')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          
          <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />

          <ToolbarButton
            isActive={activeFormats.includes('H1')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('H2')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('Quote')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />

          <ToolbarButton
            isActive={activeFormats.includes('Bullets')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={activeFormats.includes('Numbered')}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* STATUS INDICATOR */}
        <div className="mx-2 hidden sm:flex items-center gap-1.5 overflow-hidden max-w-[250px]">
          {activeFormats.length > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mr-1">FORMAT:</span>
              <div className="flex flex-wrap gap-1">
                {activeFormats.map(fmt => (
                  <span key={fmt} className="px-1.5 py-0.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-black rounded flex items-center gap-1 leading-none shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" /> {fmt}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 font-black text-[9px] tracking-widest text-zinc-300 dark:text-zinc-800 uppercase italic">
               Normal Body Text
            </div>
          )}
        </div>

        <div className="ml-auto flex gap-1 items-center py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950 transition-colors scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 relative group/editor">
        <div className="max-w-4xl mx-auto py-12 px-8 sm:px-12 min-h-full selection:bg-zinc-200 dark:selection:bg-zinc-800">
          <EditorContent editor={editor} />
        </div>

        {/* FLOATING STATUS PILL */}
        <div className="absolute top-4 right-4 pointer-events-none transition-all duration-500 opacity-0 group-hover/editor:opacity-100 transform translate-y-2 group-hover/editor:translate-y-0">
          <div className="bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-100 dark:text-zinc-900 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {activeFormats.length > 0 ? activeFormats.join(' • ') : 'Body Text'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
