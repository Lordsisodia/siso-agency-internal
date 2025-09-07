import React from 'react';
import { NotionBlock } from '@/types/notion';
import { MarkdownParser } from '../parsers/MarkdownParser';
import { TableBlock } from './TableBlock';
import { MediaBlock } from './MediaBlock';
import { 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Info,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

interface BlockRendererProps {
  block: NotionBlock;
  isEditing?: boolean;
  onContentChange?: (blockId: string, content: string) => void;
  onBlockTypeChange?: (blockId: string, type: string) => void;
  onBlockUpdate?: (blockId: string, properties: any) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isEditing = false,
  onContentChange,
  onBlockTypeChange,
  onBlockUpdate
}) => {
  const [isToggleOpen, setIsToggleOpen] = React.useState(!block.properties?.collapsed);
  
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (onContentChange) {
      onContentChange(block.id, e.currentTarget.textContent || '');
    }
  };

  const processInlineContent = (content: string) => {
    return MarkdownParser.processInlineFormatting(content);
  };

  const getCalloutIcon = (emoji?: string) => {
    if (emoji) return emoji;
    
    // Default icons based on content
    const content = block.content.toLowerCase();
    if (content.includes('note') || content.includes('info')) return '📝';
    if (content.includes('warning') || content.includes('caution')) return '⚠️';
    if (content.includes('tip') || content.includes('hint')) return '💡';
    if (content.includes('success') || content.includes('complete')) return '✅';
    if (content.includes('error') || content.includes('danger')) return '❌';
    
    return 'ℹ️';
  };

  const getCalloutStyle = (emoji?: string) => {
    const defaultEmoji = getCalloutIcon(emoji);
    
    if (defaultEmoji.includes('⚠️') || defaultEmoji.includes('❌')) {
      return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30';
    }
    if (defaultEmoji.includes('✅') || defaultEmoji.includes('🟢')) {
      return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30';
    }
    if (defaultEmoji.includes('💡') || defaultEmoji.includes('⭐')) {
      return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30';
    }
    
    return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30';
  };

  const renderBlockContent = () => {
    const baseClasses = isEditing 
      ? "outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1" 
      : "";
    
    const indentLevel = block.properties?.level || 0;
    const indentStyle = { marginLeft: `${indentLevel * 24}px` };

    switch (block.type) {
      case 'heading1':
        return (
          <h1 
            className={`text-3xl font-bold text-gray-900 dark:text-white mb-4 ${baseClasses}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
          />
        );

      case 'heading2':
        return (
          <h2 
            className={`text-2xl font-semibold text-gray-900 dark:text-white mb-3 ${baseClasses}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
          />
        );

      case 'heading3':
        return (
          <h3 
            className={`text-xl font-medium text-gray-900 dark:text-white mb-2 ${baseClasses}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
          />
        );

      case 'paragraph':
        return (
          <p 
            className={`text-gray-700 dark:text-gray-300 mb-2 leading-relaxed ${baseClasses}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
          />
        );

      case 'bulleted_list':
        return (
          <div className="flex items-start mb-1" style={indentStyle}>
            <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1 text-sm">•</span>
            <div 
              className={`text-gray-700 dark:text-gray-300 flex-1 ${baseClasses}`}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
            />
          </div>
        );

      case 'numbered_list':
        return (
          <div className="flex items-start mb-1" style={indentStyle}>
            <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1 text-sm min-w-[20px]">1.</span>
            <div 
              className={`text-gray-700 dark:text-gray-300 flex-1 ${baseClasses}`}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
            />
          </div>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-r">
            <div 
              className={`text-gray-700 dark:text-gray-300 italic ${baseClasses}`}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
            />
          </blockquote>
        );

      case 'callout':
        const calloutIcon = getCalloutIcon(block.properties?.emoji);
        const calloutStyle = getCalloutStyle(block.properties?.emoji);
        return (
          <div className={`border rounded-lg p-4 mb-4 ${calloutStyle}`}>
            <div className="flex items-start">
              <span className="text-lg mr-3 mt-0.5">{calloutIcon}</span>
              <div 
                className={`text-gray-700 dark:text-gray-300 flex-1 ${baseClasses}`}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
              />
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="mb-2">
            <div 
              className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsToggleOpen(!isToggleOpen)}
            >
              {isToggleOpen ? (
                <ChevronDown className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
              )}
              <div 
                className={`text-gray-700 dark:text-gray-300 flex-1 ${baseClasses}`}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
              />
            </div>
            {isToggleOpen && block.children && (
              <div className="ml-6 mt-2">
                {block.children.map(child => (
                  <BlockRenderer 
                    key={child.id} 
                    block={child} 
                    isEditing={isEditing}
                    onContentChange={onContentChange}
                    onBlockTypeChange={onBlockTypeChange}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="mb-4">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
              {block.properties?.language && (
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-gray-400 text-sm border-b border-gray-700">
                  {block.properties.language}
                </div>
              )}
              <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
                <code 
                  className={`block ${baseClasses}`}
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onInput={handleContentChange}
                >
                  {block.content}
                </code>
              </pre>
            </div>
          </div>
        );

      case 'divider':
        return (
          <hr className="border-gray-300 dark:border-gray-600 my-6" />
        );

      case 'table':
        return (
          <TableBlock block={block} isEditing={isEditing} onBlockUpdate={onBlockUpdate} />
        );

      case 'image':
        return (
          <MediaBlock block={block} isEditing={isEditing} onBlockUpdate={onBlockUpdate} />
        );

      case 'video':
        return (
          <MediaBlock block={block} isEditing={isEditing} onBlockUpdate={onBlockUpdate} />
        );

      case 'embed':
        return (
          <MediaBlock block={block} isEditing={isEditing} onBlockUpdate={onBlockUpdate} />
        );

      default:
        return (
          <div 
            className={`text-gray-700 dark:text-gray-300 mb-2 ${baseClasses}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: processInlineContent(block.content) }}
          />
        );
    }
  };

  return (
    <div className="notion-block">
      {renderBlockContent()}
    </div>
  );
}; 