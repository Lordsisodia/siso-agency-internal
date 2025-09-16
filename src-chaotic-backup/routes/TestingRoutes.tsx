import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AIAssistantTesting from '../pages/test/AIAssistantTesting';

/**
 * Testing Routes
 * Routes for development and testing interfaces
 * Only available in development environment
 */
export const TestingRoutes: React.FC = () => {
  // Only render testing routes in development
  if (process.env.NODE_ENV !== 'development') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/test/ai-assistant" element={<AIAssistantTesting />} />
      <Route path="/test" element={<Navigate to="/test/ai-assistant" replace />} />
    </Routes>
  );
};

export default TestingRoutes;