import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NotionBlock, ParsedContent } from '@/types/notion';
import { MarkdownParser } from './parsers/MarkdownParser';
import { BlockRenderer } from './blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { 
  Type,
  Hash,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Lightbulb,
  ChevronRight,
  MoreHorizontal,
  Table,
  Image,
  Video,
  Globe
} from 'lucide-react';

interface NotionEditorProps {
  initialContent?: string;
  onChange?: (content: string, blocks: NotionBlock[]) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const NotionEditor: React.FC<NotionEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Type \'/\' for commands, or start writing...',
  className = '',
  readOnly = false
}) => {
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [slashFilter, setSlashFilter] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<{ [key: string]: HTMLElement }>({});

  // Initialize editor with content
  useEffect(() => {
    if (initialContent && blocks.length === 0) {
      const parsed = MarkdownParser.parseToBlocks(initialContent);
      setBlocks(parsed.blocks);
    }
  }, [initialContent]);

  // Auto-generate initial block if empty
  useEffect(() => {
    if (blocks.length === 0 && !readOnly) {
      const initialBlock: NotionBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'paragraph',
        content: ''
      };
      setBlocks([initialBlock]);
      setFocusedBlockId(initialBlock.id);
    }
  }, [blocks.length, readOnly]);

  // Handle content changes with auto-formatting
  const handleContentChange = useCallback((blockId: string, content: string) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block => {
        if (block.id === blockId) {
          // Apply auto-formatting
          const formattedBlock = applyAutoFormatting({ ...block, content });
          return formattedBlock;
        }
        return block;
      });
      
      // Convert blocks back to markdown for onChange callback
      if (onChange) {
        const markdown = MarkdownParser.blocksToMarkdown(updatedBlocks);
        onChange(markdown, updatedBlocks);
      }
      
      return updatedBlocks;
    });
  }, [onChange]);

  // Auto-formatting function that detects patterns and converts them
  const applyAutoFormatting = (block: NotionBlock): NotionBlock => {
    const { content } = block;
    
    // Skip if block is already formatted or empty
    if (!content || content.trim().length === 0) {
      return block;
    }

    // Heading patterns
    if (content.startsWith('# ') && block.type !== 'heading1') {
      return {
        ...block,
        type: 'heading1',
        content: content.substring(2)
      };
    }
    
    if (content.startsWith('## ') && block.type !== 'heading2') {
      return {
        ...block,
        type: 'heading2',
        content: content.substring(3)
      };
    }
    
    if (content.startsWith('### ') && block.type !== 'heading3') {
      return {
        ...block,
        type: 'heading3',
        content: content.substring(4)
      };
    }

    // List patterns
    if (content.startsWith('- ') && block.type !== 'bulleted_list') {
      return {
        ...block,
        type: 'bulleted_list',
        content: content.substring(2)
      };
    }
    
    if (content.match(/^\d+\. /) && block.type !== 'numbered_list') {
      return {
        ...block,
        type: 'numbered_list',
        content: content.replace(/^\d+\. /, '')
      };
    }

    // Quote pattern
    if (content.startsWith('> ') && block.type !== 'quote') {
      return {
        ...block,
        type: 'quote',
        content: content.substring(2)
      };
    }

    // Code block pattern
    if (content.startsWith('```') && block.type !== 'code') {
      return {
        ...block,
        type: 'code',
        content: content.substring(3),
        properties: {
          language: 'javascript'
        }
      };
    }

    // Callout pattern
    if (content.startsWith('> 💡 ') && block.type !== 'callout') {
      return {
        ...block,
        type: 'callout',
        content: content.substring(5),
        properties: {
          emoji: '💡',
          color: 'blue'
        }
      };
    }

    return block;
  };

  // Handle block type changes
  const handleBlockTypeChange = useCallback((blockId: string, newType: string) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block =>
        block.id === blockId ? { ...block, type: newType as any } : block
      );
      
      if (onChange) {
        const markdown = MarkdownParser.blocksToMarkdown(updatedBlocks);
        onChange(markdown, updatedBlocks);
      }
      
      return updatedBlocks;
    });
  }, [onChange]);

  // Handle block property updates
  const handleBlockUpdate = useCallback((blockId: string, properties: any) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block =>
        block.id === blockId ? { ...block, properties } : block
      );
      
      if (onChange) {
        const markdown = MarkdownParser.blocksToMarkdown(updatedBlocks);
        onChange(markdown, updatedBlocks);
      }
      
      return updatedBlocks;
    });
  }, [onChange]);

  // Enhanced keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    // Handle slash commands
    if (e.key === '/') {
      setTimeout(() => {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom });
        setShowSlashMenu(true);
        setSlashFilter('');
      }, 10);
      return;
    }

    // Handle slash menu filtering
    if (showSlashMenu && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setSlashFilter(prev => prev + e.key);
      return;
    }

    // Handle slash menu navigation
    if (showSlashMenu) {
      if (e.key === 'Escape') {
        setShowSlashMenu(false);
        setSlashFilter('');
        return;
      }
      if (e.key === 'Backspace' && slashFilter.length > 0) {
        setSlashFilter(prev => prev.slice(0, -1));
        return;
      }
    }

    // Hide slash menu on navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      setShowSlashMenu(false);
    }

    // Handle formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyInlineFormatting('bold');
          return;
        case 'i':
          e.preventDefault();
          applyInlineFormatting('italic');
          return;
        case 'u':
          e.preventDefault();
          applyInlineFormatting('underline');
          return;
        case 'k':
          e.preventDefault();
          applyInlineFormatting('link');
          return;
      }
    }

    // Handle Enter key for new blocks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnterKey();
      return;
    }

    // Handle Tab for indentation in lists
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabIndentation(e.shiftKey);
      return;
    }

    // Handle backspace for block deletion/merging
    if (e.key === 'Backspace') {
      handleBackspace(e);
      return;
    }
  };

  // Apply inline formatting (bold, italic, etc.)
  const applyInlineFormatting = (format: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'link':
          formattedText = `[${selectedText}](url)`;
          break;
        default:
          return;
      }
      
      // Replace selected text with formatted version
      range.deleteContents();
      range.insertNode(document.createTextNode(formattedText));
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  // Enhanced Enter key handling
  const handleEnterKey = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const focusedElement = document.activeElement;
    const blockElement = focusedElement?.closest('[data-block-id]');
    const currentBlockId = blockElement?.getAttribute('data-block-id');
    
    if (currentBlockId) {
      const currentBlock = blocks.find(b => b.id === currentBlockId);
      if (currentBlock) {
        // Create new block after current one
        const newBlock: NotionBlock = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'paragraph',
          content: ''
        };
        
        const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
        const newBlocks = [
          ...blocks.slice(0, currentIndex + 1),
          newBlock,
          ...blocks.slice(currentIndex + 1)
        ];
        
        setBlocks(newBlocks);
        setFocusedBlockId(newBlock.id);
        
        // Focus the new block after render
        setTimeout(() => {
          const newBlockElement = blockRefs.current[newBlock.id];
          if (newBlockElement) {
            const editableElement = newBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
            if (editableElement) {
              editableElement.focus();
            }
          }
        }, 10);
      }
    }
  };

  const handleTabIndentation = (reverse: boolean) => {
    // TODO: Implement list indentation logic for nested lists
    console.log('Tab indentation:', reverse ? 'reverse' : 'forward');
  };

  const handleBackspace = (e: React.KeyboardEvent) => {
    const selection = window.getSelection();
    if (!selection) return;

    const focusedElement = document.activeElement;
    const blockElement = focusedElement?.closest('[data-block-id]');
    const currentBlockId = blockElement?.getAttribute('data-block-id');
    
    if (currentBlockId) {
      const currentBlock = blocks.find(b => b.id === currentBlockId);
      const isAtStart = selection.anchorOffset === 0 && selection.focusOffset === 0;
      
      if (currentBlock && isAtStart && currentBlock.content === '') {
        e.preventDefault();
        
        // If it's the only block, keep it
        if (blocks.length === 1) {
          return;
        }
        
        // Remove current block and focus previous one
        const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
        if (currentIndex > 0) {
          const newBlocks = blocks.filter(b => b.id !== currentBlockId);
          setBlocks(newBlocks);
          
          const previousBlock = newBlocks[currentIndex - 1];
          setFocusedBlockId(previousBlock.id);
          
          // Focus the previous block
          setTimeout(() => {
            const prevBlockElement = blockRefs.current[previousBlock.id];
            if (prevBlockElement) {
              const editableElement = prevBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
              if (editableElement) {
                editableElement.focus();
                // Move cursor to end
                const range = document.createRange();
                range.selectNodeContents(editableElement);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 10);
        }
      }
    }
  };

  // Slash command menu items
  const slashCommands = [
    {
      icon: Type,
      label: 'Text',
      description: 'Just start typing with plain text',
      command: 'paragraph',
      keywords: ['text', 'paragraph', 'plain']
    },
    {
      icon: Hash,
      label: 'Heading 1',
      description: 'Big section heading',
      command: 'heading1',
      keywords: ['heading', 'h1', 'title', 'big']
    },
    {
      icon: Hash,
      label: 'Heading 2', 
      description: 'Medium section heading',
      command: 'heading2',
      keywords: ['heading', 'h2', 'subtitle', 'medium']
    },
    {
      icon: Hash,
      label: 'Heading 3',
      description: 'Small section heading',
      command: 'heading3',
      keywords: ['heading', 'h3', 'small']
    },
    {
      icon: List,
      label: 'Bulleted list',
      description: 'Create a simple bulleted list',
      command: 'bulleted_list',
      keywords: ['bullet', 'list', 'unordered', '-']
    },
    {
      icon: ListOrdered,
      label: 'Numbered list',
      description: 'Create a list with numbering',
      command: 'numbered_list',
      keywords: ['number', 'numbered', 'ordered', 'list', '1.']
    },
    {
      icon: ChevronRight,
      label: 'Toggle list',
      description: 'Create a collapsible toggle list',
      command: 'toggle',
      keywords: ['toggle', 'collapsible', 'dropdown']
    },
    {
      icon: Quote,
      label: 'Quote',
      description: 'Capture a quote',
      command: 'quote',
      keywords: ['quote', 'blockquote', '>']
    },
    {
      icon: Lightbulb,
      label: 'Callout',
      description: 'Make writing stand out',
      command: 'callout',
      keywords: ['callout', 'highlight', 'note', 'info']
    },
    {
      icon: Code,
      label: 'Code',
      description: 'Capture a code snippet',
      command: 'code',
      keywords: ['code', 'snippet', 'programming', '```']
    },
    {
      icon: Minus,
      label: 'Divider',
      description: 'Visually divide blocks',
      command: 'divider',
      keywords: ['divider', 'separator', 'hr', '---']
    },
    {
      icon: Table,
      label: 'Table',
      description: 'Create a table',
      command: 'table',
      keywords: ['table', 'grid', 'data']
    },
    {
      icon: Image,
      label: 'Image',
      description: 'Insert an image',
      command: 'image',
      keywords: ['image', 'photo', 'picture', 'img']
    },
    {
      icon: Video,
      label: 'Video',
      description: 'Insert a video',
      command: 'video',
      keywords: ['video', 'movie', 'youtube', 'vimeo']
    },
    {
      icon: Globe,
      label: 'Embed',
      description: 'Embed external content',
      command: 'embed',
      keywords: ['embed', 'external', 'link', 'iframe']
    }
  ];

  // Filter slash commands based on input
  const filteredCommands = slashCommands.filter(command => {
    if (!slashFilter) return true;
    const query = slashFilter.toLowerCase();
    return (
      command.label.toLowerCase().includes(query) ||
      command.keywords.some(keyword => keyword.includes(query))
    );
  });

  const handleSlashCommand = (command: string) => {
    if (focusedBlockId) {
      handleBlockTypeChange(focusedBlockId, command);
    }
    setShowSlashMenu(false);
    setSlashFilter('');
  };

  // Handle paste events for markdown content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    
    if (pastedText) {
      // If pasting multiple lines, create multiple blocks
      const lines = pastedText.split('\n');
      if (lines.length > 1) {
        const parsed = MarkdownParser.parseToBlocks(pastedText);
        setBlocks(prevBlocks => [...prevBlocks, ...parsed.blocks]);
        
        if (onChange) {
          const allBlocks = [...blocks, ...parsed.blocks];
          const markdown = MarkdownParser.blocksToMarkdown(allBlocks);
          onChange(markdown, allBlocks);
        }
      } else {
        // Single line paste - insert into current block
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(pastedText));
        }
      }
    }
  };

  // Handle block focus
  const handleBlockFocus = (blockId: string) => {
    setFocusedBlockId(blockId);
    setCurrentBlockId(blockId);
  };

  return (
    <div className={`notion-editor relative ${className}`}>
      <div
        ref={editorRef}
        className={`
          min-h-[300px] p-6 rounded-xl border transition-all duration-200
          bg-slate-800/60 backdrop-blur-sm
          border-slate-600/50
          focus-within:ring-2 focus-within:ring-slate-400/20 focus-within:border-slate-400/40
          hover:border-slate-500/70
          ${readOnly ? 'cursor-default' : 'cursor-text'}
        `}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ outline: 'none' }}
      >
        {blocks.length === 0 && !readOnly ? (
          <div className="text-slate-400 text-lg">
            {placeholder}
          </div>
        ) : (
          blocks.map((block, index) => (
            <div 
              key={block.id}
              data-block-id={block.id}
              ref={el => {
                if (el) blockRefs.current[block.id] = el;
              }}
              className={`
                notion-block relative group transition-all duration-150
                ${focusedBlockId === block.id ? 'ring-1 ring-slate-400/20 rounded-lg' : ''}
                ${index > 0 ? 'mt-2' : ''}
              `}
              onFocus={() => handleBlockFocus(block.id)}
            >
              <BlockRenderer
                block={block}
                isEditing={!readOnly}
                onContentChange={handleContentChange}
                onBlockTypeChange={handleBlockTypeChange}
                onBlockUpdate={handleBlockUpdate}
              />
            </div>
          ))
        )}
      </div>

      {/* Enhanced Slash Command Menu */}
      {showSlashMenu && !readOnly && (
        <div
          ref={slashMenuRef}
          className="absolute z-50 bg-slate-800/95 border border-slate-600/50 rounded-xl shadow-2xl py-2 min-w-[320px] max-h-[400px] overflow-y-auto backdrop-blur-md"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y + 8
          }}
        >
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-600/50">
            {slashFilter ? `Filtered by "${slashFilter}"` : 'Basic blocks'}
          </div>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item) => (
              <button
                key={item.command}
                className="w-full px-4 py-3 text-left hover:bg-slate-700/60 flex items-center transition-colors duration-150 border-l-2 border-transparent hover:border-slate-400"
                onClick={() => handleSlashCommand(item.command)}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-slate-700/60 rounded-lg mr-3">
                  <item.icon className="w-4 h-4 text-slate-200" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.description}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-slate-400">
              <div className="text-sm">No blocks found</div>
              <div className="text-xs">Try a different search term</div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Editor Toolbar */}
      {!readOnly && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MoreHorizontal className="w-4 h-4 mr-1" />
              Type <kbd className="mx-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs font-mono">/ </kbd> 
              for commands
            </span>
            <span className="flex items-center">
              <Code className="w-4 h-4 mr-1" />
              <kbd className="mx-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs font-mono">⌘B</kbd>
              <kbd className="mx-1 px-2 py-0.5 bg-slate-700/60 rounded text-xs font-mono">⌘I</kbd>
              for formatting
            </span>
          </div>
          <div className="text-xs">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}; 