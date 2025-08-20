import React, { useState, useEffect, useRef } from 'react';
import { Brain, Eye, EyeOff } from 'lucide-react';

function ThinkingStream({ content, isActive, className = '' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [displayContent, setDisplayContent] = useState('');
  const contentRef = useRef(null);
  const typewriterRef = useRef(null);

  // Typewriter effect for streaming content
  useEffect(() => {
    if (!content || !isVisible) return;

    // Clear any existing typewriter
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }

    if (content.length <= displayContent.length) return;

    const remainingContent = content.slice(displayContent.length);
    let index = 0;

    const typeNextChar = () => {
      if (index < remainingContent.length) {
        setDisplayContent(prev => prev + remainingContent[index]);
        index++;
        typewriterRef.current = setTimeout(typeNextChar, 20); // Adjust speed as needed
      }
    };

    typeNextChar();

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [content, isVisible]);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayContent]);

  // Reset display content when new thinking session starts
  useEffect(() => {
    if (!isActive) {
      setDisplayContent('');
    }
  }, [isActive]);

  if (!content || content.trim().length === 0) {
    return null;
  }

  return (
    <div className={`${className} bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden`}>
      <div className="flex items-center justify-between p-3 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${isActive ? 'animate-pulse' : ''}`} />
          <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
            {isActive ? 'Thinking...' : 'Thought Process'}
          </h3>
          {isActive && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors"
          title={isVisible ? 'Hide thinking' : 'Show thinking'}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          )}
        </button>
      </div>

      {isVisible && (
        <div
          ref={contentRef}
          className="p-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600"
        >
          <div className="prose prose-sm prose-purple dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-purple-900 dark:text-purple-100 font-mono leading-relaxed">
              {displayContent}
              {isActive && displayContent.length < content.length && (
                <span className="inline-block w-2 h-4 bg-purple-600 dark:bg-purple-400 animate-pulse ml-1"></span>
              )}
            </pre>
          </div>
        </div>
      )}

      {!isVisible && (
        <div className="p-3 text-center">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Thinking content hidden • Click the eye icon to show
          </p>
        </div>
      )}
    </div>
  );
}

export default ThinkingStream;