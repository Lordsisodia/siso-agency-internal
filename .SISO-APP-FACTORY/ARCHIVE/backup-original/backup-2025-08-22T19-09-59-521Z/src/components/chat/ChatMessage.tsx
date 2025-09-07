
import React from 'react';
import { Bot, User, Code, Copy, Check, Notebook, MessageSquare, ExternalLink, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  role: 'assistant' | 'user';
  content: string;
  assistantType?: string;
  isLoading?: boolean;
  steps?: {
    thinking?: string;
    searching?: string;
    response?: string;
  };
  richContent?: {
    tools?: {
      id: string;
      name: string;
      description: string;
      type: 'ai' | 'automation' | 'integration';
      url: string;
      rating?: number;
      imageUrl?: string;
    }[];
    videos?: {
      id: string;
      title: string;
      thumbnailUrl: string;
      duration: string;
      channelName: string;
      views: number;
    }[];
    resources?: {
      type: 'documentation' | 'tutorial' | 'github' | 'article';
      title: string;
      url: string;
      icon: string;
    }[];
  };
}

export const ChatMessage = ({ role, content, assistantType, isLoading, steps, richContent }: ChatMessageProps) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  
  // [Analysis] Enhanced content formatting with Markdown-like support
  const formatContent = (text: string) => {
    // Handle code blocks first
    const segments = text.split(/(```[\s\S]*?```)/);
    
    return segments.map((segment, index) => {
      // Handle code blocks
      if (segment.startsWith('```')) {
        const [, ...codeLines] = segment.split('\n');
        codeLines.pop();
        const code = codeLines.join('\n');
        
        const copyCode = () => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        return (
          <div key={index} className="relative my-4 rounded-lg bg-black/50 p-4 font-mono text-sm shadow-lg">
            <div className="absolute right-2 top-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-siso-text hover:bg-siso-text/10 transition-colors"
                onClick={copyCode}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Code className="mb-2 h-4 w-4 text-siso-orange" />
            <pre className="mt-2 overflow-x-auto">{code}</pre>
          </div>
        );
      }

      // Process regular text content
      const lines = segment.split('\n');
      
      return (
        <div key={index} className="space-y-4">
          {lines.map((line, lineIndex) => {
            // Handle bullet points
            if (line.trim().startsWith('- ')) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 pl-4">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-siso-orange/70" />
                  <p className="flex-1 text-siso-text/90">{line.slice(2)}</p>
                </div>
              );
            }

            // Handle numbered lists
            if (/^\d+\.\s/.test(line.trim())) {
              const [number, ...rest] = line.trim().split(/\.\s/);
              return (
                <div key={lineIndex} className="flex items-start gap-2 pl-4">
                  <span className="text-siso-orange/70 font-mono">{number}.</span>
                  <p className="flex-1 text-siso-text/90">{rest.join('. ')}</p>
                </div>
              );
            }

            // Handle headers
            if (line.startsWith('# ')) {
              return (
                <h2 key={lineIndex} className="text-xl font-semibold text-siso-text mt-6 mb-4">
                  {line.slice(2)}
                </h2>
              );
            }

            if (line.startsWith('## ')) {
              return (
                <h3 key={lineIndex} className="text-lg font-semibold text-siso-text mt-4 mb-2">
                  {line.slice(3)}
                </h3>
              );
            }

            // Handle quotes
            if (line.startsWith('> ')) {
              return (
                <blockquote key={lineIndex} className="border-l-2 border-siso-orange/50 pl-4 italic text-siso-text/80">
                  {line.slice(2)}
                </blockquote>
              );
            }

            // Handle links
            const processedLine = line.replace(
              /(https?:\/\/[^\s]+)/g,
              (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-siso-orange hover:text-siso-red underline transition-colors">${url}</a>`
            );

            // Handle bold text
            const processedBold = processedLine.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-semibold text-siso-text-bold">$1</strong>'
            );

            // Handle italic text
            const processedItalic = processedBold.replace(
              /\*(.*?)\*/g,
              '<em class="italic text-siso-text/90">$1</em>'
            );

            return line.trim() ? (
              <p
                key={lineIndex}
                className="text-siso-text/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedItalic }}
              />
            ) : <div key={lineIndex} className="h-4" />;
          })}
        </div>
      );
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The response has been copied to your clipboard",
    });
  };

  const handleSendToNotion = () => {
    // [Plan] Implement Notion integration
    toast({
      title: "Coming soon",
      description: "Notion integration will be available soon!",
    });
  };

  const handleSendToChatGPT = () => {
    window.open(`https://chat.openai.com/share/new?text=${encodeURIComponent(content)}`, '_blank');
  };

  const renderIntegrationActions = () => {
    if (role !== 'assistant') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-black/20"
      >
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-siso-bg-alt hover:bg-siso-bg"
                onClick={handleCopyToClipboard}
              >
                <Copy className="w-4 h-4 text-siso-orange" />
                <span className="text-siso-text">Copy</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-siso-bg-alt hover:bg-siso-bg"
                onClick={handleSendToNotion}
              >
                <Notebook className="w-4 h-4 text-siso-orange" />
                <span className="text-siso-text">Send to Notion</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save to Notion</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-siso-bg-alt hover:bg-siso-bg"
                onClick={handleSendToChatGPT}
              >
                <MessageSquare className="w-4 h-4 text-siso-orange" />
                <span className="text-siso-text">Continue in ChatGPT</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Continue this conversation in ChatGPT</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  };

  const renderRichContent = () => {
    if (!richContent) return null;

    return (
      <div className="space-y-6 mt-4">
        {/* Tools Section */}
        {richContent.tools && richContent.tools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-siso-text">Related Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {richContent.tools.map((tool) => (
                <motion.div
                  key={tool.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-black/20 border border-siso-text/10"
                >
                  <div className="flex items-start gap-3">
                    {tool.imageUrl ? (
                      <img src={tool.imageUrl} alt={tool.name} className="w-12 h-12 rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-siso-text/10 flex items-center justify-center">
                        <Code className="w-6 h-6 text-siso-orange" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-siso-text">{tool.name}</h4>
                      <p className="text-sm text-siso-text/70">{tool.description}</p>
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-siso-orange hover:text-siso-red"
                          onClick={() => window.open(tool.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Videos Section */}
        {richContent.videos && richContent.videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-siso-text">Related Videos</h3>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-siso-text/10 scrollbar-track-transparent">
              {richContent.videos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-72"
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium line-clamp-2">{video.title}</p>
                      <p className="text-white/70 text-xs mt-1">{video.channelName}</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute inset-0 w-full h-full hover:bg-black/40 transition-colors group"
                    >
                      <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Resources Section */}
        {richContent.resources && richContent.resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-siso-text">Related Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {richContent.resources.map((resource, index) => (
                <motion.a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-siso-text/10 hover:bg-black/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-siso-text/10 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-siso-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-siso-text">{resource.title}</p>
                    <p className="text-xs text-siso-text/70 capitalize">{resource.type}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-4 p-6 rounded-lg transition-colors",
        role === 'assistant' ? 'bg-siso-text/5 hover:bg-siso-text/8' : 'hover:bg-black/20'
      )}
    >
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
        role === 'assistant' 
          ? 'bg-gradient-to-br from-siso-red to-siso-orange animate-glow' 
          : 'bg-gradient-to-br from-siso-text/20 to-siso-text/30'
      )}>
        {role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-siso-text-bold">
            {role === 'assistant' ? assistantType : 'You'}
          </p>
          {role === 'assistant' && (
            <span className="text-xs text-siso-text-muted px-2 py-1 rounded-full bg-siso-text/10">
              AI Assistant
            </span>
          )}
        </div>
        <div className="text-siso-text prose prose-invert max-w-none">
          {role === 'assistant' && renderIntegrationActions()}
          {isLoading ? (
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-siso-orange/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-siso-orange/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-siso-orange/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <>
              {steps && (
                <div className="space-y-2 mb-4 text-sm text-siso-text/80">
                  {Object.entries(steps).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        key === 'response' && "text-siso-orange font-medium"
                      )}
                    >
                      {value}
                    </motion.div>
                  ))}
                </div>
              )}
              {content && formatContent(content)}
              {renderRichContent()}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
