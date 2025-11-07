import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link as LinkIcon, Highlighter, Palette, Eraser
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const Toolbar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [color, setColor] = useState('#000000');
  const [highlight, setHighlight] = useState('#ffff00');
  const [imageUrl, setImageUrl] = useState('');

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, icon: Icon, tooltip }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-8 w-8 p-0 transition-colors cursor-pointer rounded hover:bg-muted hover:text-foreground',
        isActive && 'bg-accent text-accent-foreground'
      )}
      title={tooltip}
    >
      <Icon className="h-4 w-4" />
    </Button>

  );

  return (
    <div className="flex items-center flex-wrap gap-1 border-b bg-background/60 backdrop-blur p-2 rounded-md shadow-sm">
      {/* --- Text Formatting --- */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={Bold}
        tooltip="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={Italic}
        tooltip="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        icon={Strikethrough}
        tooltip="Strikethrough"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        icon={Code}
        tooltip="Inline Code"
      />

      {/* --- Headings --- */}
      {[1, 2, 3].map((level) => (
        <ToolbarButton
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          isActive={editor.isActive('heading', { level })}
          icon={level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3}
          tooltip={`Heading ${level}`}
        />
      ))}

      {/* --- Lists, Quote --- */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={List}
        tooltip="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={ListOrdered}
        tooltip="Numbered List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        icon={Quote}
        tooltip="Quote"
      />

      {/* --- Alignment --- */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        icon={AlignLeft}
        tooltip="Align Left"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        icon={AlignCenter}
        tooltip="Align Center"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        icon={AlignRight}
        tooltip="Align Right"
      />

      {/* --- Colors & Highlight --- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Text Color"
            className="hover:bg-muted hover:text-foreground">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 flex items-center gap-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <Button onClick={() => editor.chain().focus().setColor(color).run()} size="sm">
            Apply
          </Button>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Highlight"
           className="hover:bg-muted hover:text-foreground">
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 flex items-center gap-2">
          <input type="color" value={highlight} onChange={(e) => setHighlight(e.target.value)} />
          <Button onClick={() => editor.chain().focus().setHighlight({ color: highlight }).run()} size="sm">
            Apply
          </Button>
        </PopoverContent>
      </Popover>

      {/* --- Links & Images --- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Insert Link"
           className="hover:bg-muted hover:text-foreground">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 flex items-center gap-2">
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              editor.chain().focus().setLink({ href: linkUrl }).run();
              setLinkUrl('');
            }}
            size="sm"
          >
            Add
          </Button>
        </PopoverContent>
      </Popover>

      {/* <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 flex items-center gap-2">
          <Input
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              editor.chain().focus().setImage({ src: imageUrl }).run();
              setImageUrl('');
            }}
            size="sm"
          >
            Add
          </Button>
        </PopoverContent>
      </Popover> */}

      {/* --- Clear & Undo/Redo --- */}
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        icon={Eraser}
        tooltip="Clear Formatting"
      />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} tooltip="Undo" />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} tooltip="Redo" />
    </div>
  );
};

export default Toolbar;
