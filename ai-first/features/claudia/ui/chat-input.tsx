import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isThinking?: boolean;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, isThinking, ...props }, ref) => (
    <div className="relative">
      <Textarea
        autoComplete="off"
        ref={ref}
        name="message"
        className={cn(
          "max-h-12 px-4 py-3 bg-gray-800 border-gray-600 text-white text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none pr-12",
          className,
        )}
        placeholder={isThinking ? "Thinking..." : props.placeholder || "Message SISO..."}
        disabled={isThinking || props.disabled}
        {...props}
      />
      
      {/* SISO Logo */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {isThinking ? (
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <img 
            src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
            alt="SISO" 
            className="w-5 h-5 opacity-70" 
          />
        )}
      </div>
    </div>
  ),
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
