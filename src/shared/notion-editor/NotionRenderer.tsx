import React from 'react';
import { NotionBlock, ParsedContent } from '@/types/notion';
import { MarkdownParser } from './parsers/MarkdownParser';
import { BlockRenderer } from './blocks/BlockRenderer';

interface NotionRendererProps {
  content?: string;
  blocks?: NotionBlock[];
  className?: string;
}

export const NotionRenderer: React.FC<NotionRendererProps> = ({
  content,
  blocks,
  className = ''
}) => {
  const [parsedBlocks, setParsedBlocks] = React.useState<NotionBlock[]>([]);

  React.useEffect(() => {
    if (blocks) {
      setParsedBlocks(blocks);
    } else if (content) {
      const parsed = MarkdownParser.parseToBlocks(content);
      setParsedBlocks(parsed.blocks);
    }
  }, [content, blocks]);

  if (parsedBlocks.length === 0) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 italic ${className}`}>
        No content available
      </div>
    );
  }

  return (
    <div className={`notion-renderer ${className}`}>
      {parsedBlocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isEditing={false}
        />
      ))}
    </div>
  );
}; 