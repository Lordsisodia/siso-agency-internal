import { NotionBlock, BlockType, ParsedContent } from '@/types/notion';

export class MarkdownParser {
  private static generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse markdown text into NotionBlocks
   */
  static parseToBlocks(text: string): ParsedContent {
    const lines = text.split('\n');
    const blocks: NotionBlock[] = [];
    let currentListLevel = 0;
    let currentListType: 'bulleted_list' | 'numbered_list' | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines (but preserve them as paragraph blocks)
      if (trimmedLine === '') {
        blocks.push({
          id: this.generateId(),
          type: 'paragraph',
          content: ''
        });
        continue;
      }

      const block = this.parseLine(line);
      if (block) {
        blocks.push(block);
      }
    }

    return { blocks };
  }

  /**
   * Parse a single line into a NotionBlock
   */
  private static parseLine(line: string): NotionBlock | null {
    const trimmedLine = line.trim();
    
    // Headings
    if (trimmedLine.startsWith('# ')) {
      return {
        id: this.generateId(),
        type: 'heading1',
        content: trimmedLine.substring(2)
      };
    }
    
    if (trimmedLine.startsWith('## ')) {
      return {
        id: this.generateId(),
        type: 'heading2', 
        content: trimmedLine.substring(3)
      };
    }
    
    if (trimmedLine.startsWith('### ')) {
      return {
        id: this.generateId(),
        type: 'heading3',
        content: trimmedLine.substring(4)
      };
    }

    // Lists
    if (trimmedLine.match(/^[-\*\+] /)) {
      return {
        id: this.generateId(),
        type: 'bulleted_list',
        content: trimmedLine.substring(2),
        properties: {
          level: this.getIndentationLevel(line)
        }
      };
    }

    if (trimmedLine.match(/^\d+\. /)) {
      const match = trimmedLine.match(/^(\d+)\. (.*)$/);
      if (match) {
        return {
          id: this.generateId(),
          type: 'numbered_list',
          content: match[2],
          properties: {
            level: this.getIndentationLevel(line)
          }
        };
      }
    }

    // Blockquotes (can be converted to callouts later)
    if (trimmedLine.startsWith('> ')) {
      return {
        id: this.generateId(),
        type: 'quote',
        content: trimmedLine.substring(2)
      };
    }

    // Code blocks
    if (trimmedLine.startsWith('```')) {
      const language = trimmedLine.substring(3).trim();
      return {
        id: this.generateId(),
        type: 'code',
        content: '', // Will be filled by multi-line parser
        properties: {
          language: language || 'text'
        }
      };
    }

    // Dividers
    if (trimmedLine.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      return {
        id: this.generateId(),
        type: 'divider',
        content: ''
      };
    }

    // Default to paragraph
    return {
      id: this.generateId(),
      type: 'paragraph',
      content: trimmedLine
    };
  }

  /**
   * Get indentation level for nested lists
   */
  private static getIndentationLevel(line: string): number {
    let level = 0;
    for (const char of line) {
      if (char === ' ') level++;
      else if (char === '\t') level += 2;
      else break;
    }
    return Math.floor(level / 2);
  }

  /**
   * Process inline formatting within text
   */
  static processInlineFormatting(text: string): string {
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not if part of bold)
    text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');
    
    // Strikethrough: ~~text~~
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Inline code: `text`
    text = text.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>');
    
    // Links: [text](url)
    text = text.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>');
    
    return text;
  }

  /**
   * Convert NotionBlocks back to markdown
   */
  static blocksToMarkdown(blocks: NotionBlock[]): string {
    return blocks.map(block => this.blockToMarkdown(block)).join('\n');
  }

  private static blockToMarkdown(block: NotionBlock): string {
    const indent = '  '.repeat(block.properties?.level || 0);
    
    switch (block.type) {
      case 'heading1':
        return `# ${block.content}`;
      case 'heading2':
        return `## ${block.content}`;
      case 'heading3':
        return `### ${block.content}`;
      case 'bulleted_list':
        return `${indent}- ${block.content}`;
      case 'numbered_list':
        return `${indent}1. ${block.content}`;
      case 'quote':
        return `> ${block.content}`;
      case 'code':
        const language = block.properties?.language || '';
        return `\`\`\`${language}\n${block.content}\n\`\`\``;
      case 'divider':
        return '---';
      case 'callout':
        const emoji = block.properties?.emoji || 'ℹ️';
        return `> ${emoji} ${block.content}`;
      case 'toggle':
        return `> ${block.content}`;
      case 'table':
        return this.tableToMarkdown(block);
      case 'image':
        const imageCaption = block.properties?.caption ? ` "${block.properties.caption}"` : '';
        return `![${imageCaption}](${block.properties?.url || ''})`;
      case 'video':
        return `[Video: ${block.properties?.caption || 'Video'}](${block.properties?.url || ''})`;
      case 'embed':
        return `[Embed: ${block.properties?.caption || 'Embedded content'}](${block.properties?.url || ''})`;
      default:
        return block.content;
    }
  }

  /**
   * Convert table block to markdown format
   */
  private static tableToMarkdown(block: NotionBlock): string {
    const columns = block.properties?.columns || [];
    const rows = block.properties?.rows || [];
    
    if (columns.length === 0 || rows.length === 0) {
      return '| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|';
    }
    
    // Header row
    const headerRow = '| ' + columns.map(col => col.name).join(' | ') + ' |';
    
    // Separator row
    const separatorRow = '| ' + columns.map(() => '--------').join(' | ') + ' |';
    
    // Data rows
    const dataRows = rows.map(row => {
      const cells = columns.map(col => {
        const cellValue = row.cells[col.id] || '';
        return String(cellValue).replace(/\|/g, '\\|'); // Escape pipes
      });
      return '| ' + cells.join(' | ') + ' |';
    });
    
    return [headerRow, separatorRow, ...dataRows].join('\n');
  }

  /**
   * Real-time formatting detection for live editing
   */
  static detectFormatting(text: string, cursorPosition: number): {
    shouldFormat: boolean;
    formatType?: BlockType;
    newContent?: string;
  } {
    const lines = text.split('\n');
    const currentLineIndex = this.getCurrentLineIndex(text, cursorPosition);
    const currentLine = lines[currentLineIndex];
    
    if (!currentLine) return { shouldFormat: false };

    // Check if user just typed space after markdown syntax
    const trimmedLine = currentLine.trim();
    
    // Heading detection
    if (trimmedLine.match(/^#{1,3} \S+/)) {
      const level = trimmedLine.indexOf(' ');
      return {
        shouldFormat: true,
        formatType: level === 1 ? 'heading1' : level === 2 ? 'heading2' : 'heading3',
        newContent: trimmedLine.substring(level + 1)
      };
    }

    // List detection
    if (trimmedLine.match(/^[-\*\+] \S+/)) {
      return {
        shouldFormat: true,
        formatType: 'bulleted_list',
        newContent: trimmedLine.substring(2)
      };
    }

    if (trimmedLine.match(/^\d+\. \S+/)) {
      return {
        shouldFormat: true,
        formatType: 'numbered_list',
        newContent: trimmedLine.replace(/^\d+\. /, '')
      };
    }

    // Quote detection
    if (trimmedLine.match(/^> \S+/)) {
      return {
        shouldFormat: true,
        formatType: 'quote',
        newContent: trimmedLine.substring(2)
      };
    }

    return { shouldFormat: false };
  }

  private static getCurrentLineIndex(text: string, cursorPosition: number): number {
    const textUpToCursor = text.substring(0, cursorPosition);
    return textUpToCursor.split('\n').length - 1;
  }
} 