/**
 * AI Assistant Page
 *
 * Main page for the AI Assistant domain
 * Accessible at /admin/ai-assistant
 */

import React from 'react';
import { ChatInterface } from '../components/ChatInterface';

export const AIAssistantPage: React.FC = () => {
  return (
    <div className="h-screen w-full bg-gray-900">
      <ChatInterface />
    </div>
  );
};

export default AIAssistantPage;
