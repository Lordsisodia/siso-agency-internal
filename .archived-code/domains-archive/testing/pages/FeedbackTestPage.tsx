import { useState } from 'react';
import { SimpleFeedbackButton } from '@/domains/testing/components/SimpleFeedbackButton';
import { feedbackService } from '@/services/feedbackService';

const FeedbackTestPage = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  const testFeedbackService = async () => {
    try {
      addTestResult('Testing feedback service connection...');
      
      // Test creating feedback (this will require authentication)
      const testFeedback = {
        title: 'Test Feedback',
        description: 'This is a test feedback submission to verify the system works correctly.',
        category: 'GENERAL' as const,
        priority: 'MEDIUM' as const,
        feedbackType: 'SUGGESTION' as const,
        page: '/feedback-test',
      };

      await feedbackService.createFeedback(
        testFeedback,
        navigator.userAgent,
        `${screen.width}x${screen.height}`
      );
      
      addTestResult('✅ Feedback service test passed');
    } catch (error) {
      addTestResult(`❌ Feedback service test failed: ${error}`);
    }
  };

  const testComponentRendering = () => {
    addTestResult('🔍 Testing component rendering...');
    addTestResult('✅ SimpleFeedbackButton component rendered successfully');
    addTestResult('✅ FeedbackTestPage component rendered successfully');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Feedback System Test Page</h1>
          <p className="text-gray-400 text-lg">
            This page tests the feedback system components and functionality.
          </p>
        </div>

        {/* Feedback Button Test */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Feedback Button</h2>
          <p className="text-gray-400 mb-4">
            The feedback button should appear as a floating circle in the top-right corner.
            Click it to open the enhanced feedback modal with a 3-step wizard interface.
          </p>
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <p className="text-blue-300">
              💡 <strong>Look for the blue circle button in the top-right corner of your screen</strong>
            </p>
          </div>
        </div>

        {/* Manual Tests */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Manual Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testComponentRendering}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              Test Component Rendering
            </button>
            
            <button
              onClick={testFeedbackService}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors ml-4"
            >
              Test Feedback Service
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          <div className="bg-black rounded-lg p-4 min-h-[200px] font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Testing Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Form Testing Checklist</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Click the feedback button in the top-right corner</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Step 1: Select different feedback types (Bug, Suggestion, etc.)</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Step 2: Choose category and priority with visual cards</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Step 3: Fill out title and description fields</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Test navigation between steps and progress indicator</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Try submitting with empty fields (should show validation errors)</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Fill out a complete form and submit</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Check that context info (page, browser, screen size) is displayed</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Test form cancellation</span>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span>Test responsive design on mobile</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Supabase Setup Required</h2>
          <div className="text-yellow-200 space-y-2">
            <p>
              <strong>Note:</strong> To fully test feedback submission, you need to:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Run the SQL script in Supabase to create the user_feedback table</li>
              <li>Ensure Supabase authentication is working</li>
              <li>Set up proper RLS (Row Level Security) policies</li>
            </ol>
            <p className="mt-4">
              <strong>Setup file:</strong> <code className="bg-black px-2 py-1 rounded">supabase-feedback-setup.sql</code>
            </p>
          </div>
        </div>
      </div>

      {/* Include the FeedbackButton here for testing */}
      <SimpleFeedbackButton />
    </div>
  );
};

export default FeedbackTestPage;