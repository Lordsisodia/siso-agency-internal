import React from "react";
import { MobileClaudeCodeInterface } from "@/features/claudia/components/MobileClaudeCodeInterface";

/**
 * Claude Code Mobile Page
 * 
 * Full-screen mobile Claude Code experience that connects to your Mac mini.
 * Access this page from your phone to control Claude Code remotely.
 */
const ClaudeCodeMobile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized layout */}
      <div className="max-w-4xl mx-auto">
        <MobileClaudeCodeInterface />
      </div>
    </div>
  );
};

export default ClaudeCodeMobile;