import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TestTube, Play, Settings } from 'lucide-react';

// Import our enhanced components and utilities
import { EnhancedAIAssistantTab } from '@/domains/task-ui/components/EnhancedAIAssistantTab';
import { FeatureFlagTester } from '@/test/utilities/FeatureFlagTester';
import { APITester } from '@/test/utilities/APITester';
import { MorningRoutineTimer } from '@/components/timers/MorningRoutineTimer';
import { AIAssistantFeatureFlags, getDefaultFeatureFlags } from '@/lib/utils/feature-flags';

/**
 * AI Assistant Testing Page
 * Comprehensive testing interface for the enhanced AI chat assistant
 * Only available in development environment
 */
export const AIAssistantTesting: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<AIAssistantFeatureFlags>(getDefaultFeatureFlags());
  const [selectedThread, setSelectedThread] = useState<string>('test-thread-1');
  const [testingPhase, setTestingPhase] = useState<'setup' | 'features' | 'integration' | 'complete'>('setup');

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Testing Interface Disabled</h2>
            <p className="text-gray-600">
              The AI Assistant testing interface is only available in development mode.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const testingPhases = [
    {
      id: 'setup',
      title: 'Environment Setup',
      description: 'Configure API keys and test connections',
      component: 'api-tester'
    },
    {
      id: 'features',
      title: 'Feature Testing',
      description: 'Enable features and test individual components',
      component: 'feature-flags'
    },
    {
      id: 'integration',
      title: 'Integration Testing',
      description: 'Test enhanced AIAssistantTab with real data',
      component: 'enhanced-tab'
    },
    {
      id: 'complete',
      title: 'End-to-End Testing',
      description: 'Full workflow testing with voice and AI',
      component: 'complete-flow'
    }
  ];

  const getCurrentPhaseIndex = () => {
    return testingPhases.findIndex(phase => phase.id === testingPhase);
  };

  const canAdvanceToPhase = (phaseId: string): boolean => {
    switch (phaseId) {
      case 'setup':
        return true;
      case 'features':
        return true; // Can test features without API keys
      case 'integration':
        return featureFlags.enableChatThreads || featureFlags.enableMorningRoutineTimer;
      case 'complete':
        return featureFlags.enableAIProcessing && featureFlags.enableVoiceToText;
      default:
        return false;
    }
  };

  const handleFeatureFlagsChange = (newFlags: AIAssistantFeatureFlags) => {
    setFeatureFlags(newFlags);
    console.log('🚩 Feature flags updated:', newFlags);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TestTube className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">AI Chat Assistant - Testing Interface</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Comprehensive testing environment for enhanced AI chat features
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                Development Only
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Testing Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testing Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {testingPhases.map((phase, index) => {
                const isActive = phase.id === testingPhase;
                const isCompleted = index < getCurrentPhaseIndex();
                const canAccess = canAdvanceToPhase(phase.id);
                
                return (
                  <Button
                    key={phase.id}
                    onClick={() => setTestingPhase(phase.id as any)}
                    variant={isActive ? "default" : isCompleted ? "outline" : "ghost"}
                    size="sm"
                    disabled={!canAccess}
                    className={`flex-1 min-w-0 ${
                      isCompleted ? 'bg-green-50 border-green-200 text-green-800' : ''
                    }`}
                  >
                    <span className="mr-2">{index + 1}.</span>
                    <span className="truncate">{phase.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Testing Interface */}
        <Tabs value={testingPhase} onValueChange={(value) => setTestingPhase(value as any)}>
          <TabsList className="hidden" /> {/* Hidden since we use buttons above */}
          
          {/* Environment Setup */}
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Environment Setup & API Testing</CardTitle>
                <p className="text-gray-600">
                  Test all API connections and ensure your environment is properly configured.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Setup Checklist</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Add API keys to .env.local file</li>
                      <li>✓ Restart development server after adding keys</li>
                      <li>✓ Run API tests to verify connections</li>
                      <li>✓ Check browser console for any error messages</li>
                    </ul>
                  </div>
                  <APITester />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Testing */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flag Testing</CardTitle>
                <p className="text-gray-600">
                  Enable individual features and test components in isolation.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FeatureFlagTester 
                    currentFlags={featureFlags}
                    onFlagsChange={handleFeatureFlagsChange}
                  />
                  
                  {/* Individual Component Testing */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Morning Routine Timer Test */}
                    {featureFlags.enableMorningRoutineTimer && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Morning Routine Timer Test</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MorningRoutineTimer
                            featureFlags={featureFlags}
                            threadId="test-morning-routine"
                            onSessionComplete={(session) => {
                              console.log('✅ Morning routine completed:', session);
                            }}
                            onTaskCreated={(task) => {
                              console.log('✅ Task created:', task);
                            }}
                          />
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Feature Status Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Feature Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(featureFlags).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                              <Badge variant={enabled ? "default" : "secondary"}>
                                {enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Testing */}
          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced AIAssistantTab Integration</CardTitle>
                <p className="text-gray-600">
                  Test the enhanced AIAssistantTab component with your current feature flags.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Integration Test</h4>
                    <p className="text-sm text-green-800">
                      This tests the enhanced AIAssistantTab component with backward compatibility.
                      All existing functionality should work, plus new features based on your flags.
                    </p>
                  </div>
                  
                  {/* Enhanced AIAssistantTab Test */}
                  <div className="border rounded-lg p-4 bg-white">
                    <EnhancedAIAssistantTab
                      featureFlags={featureFlags}
                      initialMessage="Hello! This is a test of the enhanced AI assistant."
                      onResponse={(response) => {
                        console.log('✅ AI Response:', response);
                      }}
                      onTaskCreated={(task) => {
                        console.log('✅ Task Created:', task);
                      }}
                      className="h-96"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Testing Instructions:</strong>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>• Try typing a message and sending it</li>
                      <li>• Test voice input if enabled</li>
                      <li>• Start a morning routine if timer is enabled</li>
                      <li>• Check browser console for service logs</li>
                      <li>• Verify no errors in existing functionality</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complete Flow Testing */}
          <TabsContent value="complete">
            <Card>
              <CardHeader>
                <CardTitle>End-to-End Workflow Testing</CardTitle>
                <p className="text-gray-600">
                  Test the complete user workflow from voice input to AI processing to task creation.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Complete Workflow Test</h4>
                    <p className="text-sm text-purple-800">
                      This tests the entire pipeline: Voice → Transcription → AI Processing → Task Creation → Storage
                    </p>
                  </div>

                  {/* Workflow Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { step: 1, title: 'Voice Input', status: featureFlags.enableVoiceToText },
                      { step: 2, title: 'AI Processing', status: featureFlags.enableAIProcessing },
                      { step: 3, title: 'Task Creation', status: featureFlags.enableTaskCreation },
                      { step: 4, title: 'Data Storage', status: featureFlags.enableConversationHistory }
                    ].map((item) => (
                      <Card key={item.step} className={`text-center ${
                        item.status ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <CardContent className="pt-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            item.status ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {item.step}
                          </div>
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant={item.status ? "default" : "secondary"} className="mt-2">
                            {item.status ? 'Ready' : 'Disabled'}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Full Testing Interface */}
                  <div className="border rounded-lg p-6 bg-white">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Complete Workflow Test
                    </h4>
                    
                    <EnhancedAIAssistantTab
                      featureFlags={featureFlags}
                      initialMessage="🎯 Complete workflow test: Try saying 'I need to plan my morning routine and create some tasks for today.'"
                      onResponse={(response) => {
                        console.log('🤖 AI Response:', response);
                      }}
                      onTaskCreated={(task) => {
                        console.log('✅ Task Created:', task);
                      }}
                      onSessionComplete={(session) => {
                        console.log('🏁 Session Complete:', session);
                      }}
                      className="h-96"
                    />
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Testing Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>□ Voice input records properly</li>
                        <li>□ AI provides relevant responses</li>
                        <li>□ Tasks are created from conversation</li>
                        <li>□ Morning routine timer works</li>
                      </ul>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>□ Chat threads persist</li>
                        <li>□ No console errors</li>
                        <li>□ Performance is acceptable</li>
                        <li>□ All features work together</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistantTesting;