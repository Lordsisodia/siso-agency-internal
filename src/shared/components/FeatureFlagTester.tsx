import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { 
  Settings, 
  TestTube, 
  MessageSquare, 
  Timer, 
  Brain, 
  Mic,
  Database,
  Zap
} from 'lucide-react';
import { AIAssistantFeatureFlags } from '../utils/feature-flags';

interface FeatureFlagTesterProps {
  currentFlags: AIAssistantFeatureFlags;
  onFlagsChange: (flags: AIAssistantFeatureFlags) => void;
  className?: string;
}

/**
 * Feature Flag Testing Interface
 * Allows developers to easily toggle features during development and testing
 * Should only be shown in development/testing environments
 */
export const FeatureFlagTester: React.FC<FeatureFlagTesterProps> = ({
  currentFlags,
  onFlagsChange,
  className = ''
}) => {
  const [testingMode, setTestingMode] = useState(false);
  const [flags, setFlags] = useState<AIAssistantFeatureFlags>(currentFlags);

  // Update internal state when props change
  useEffect(() => {
    setFlags(currentFlags);
  }, [currentFlags]);

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleFlagChange = (flagName: keyof AIAssistantFeatureFlags, value: boolean) => {
    const newFlags = { ...flags, [flagName]: value };
    setFlags(newFlags);
    onFlagsChange(newFlags);
  };

  const enableAllFeatures = () => {
    const allEnabled: AIAssistantFeatureFlags = {
      enableChatThreads: true,
      enableConversationHistory: true,
      enablePersonalChatMode: true,
      enableMorningRoutineTimer: true,
      enableVoiceToText: true,
      enableAIProcessing: true,
      enableTaskCreation: true,
      enableInsightGeneration: true
    };
    setFlags(allEnabled);
    onFlagsChange(allEnabled);
  };

  const disableAllFeatures = () => {
    const allDisabled: AIAssistantFeatureFlags = {
      enableChatThreads: false,
      enableConversationHistory: false,
      enablePersonalChatMode: false,
      enableMorningRoutineTimer: false,
      enableVoiceToText: false,
      enableAIProcessing: false,
      enableTaskCreation: false,
      enableInsightGeneration: false
    };
    setFlags(allDisabled);
    onFlagsChange(allDisabled);
  };

  const enableCoreFeatures = () => {
    const coreEnabled: AIAssistantFeatureFlags = {
      enableChatThreads: true,
      enableConversationHistory: false,
      enablePersonalChatMode: true,
      enableMorningRoutineTimer: true,
      enableVoiceToText: true,
      enableAIProcessing: true,
      enableTaskCreation: true,
      enableInsightGeneration: false
    };
    setFlags(coreEnabled);
    onFlagsChange(coreEnabled);
  };

  const flagConfigs = [
    {
      key: 'enableChatThreads' as keyof AIAssistantFeatureFlags,
      title: 'Chat Threads',
      description: 'Multiple conversation threads management',
      icon: MessageSquare,
      category: 'Core'
    },
    {
      key: 'enableConversationHistory' as keyof AIAssistantFeatureFlags,
      title: 'Conversation History',
      description: 'Persistent chat history and search',
      icon: Database,
      category: 'Storage'
    },
    {
      key: 'enablePersonalChatMode' as keyof AIAssistantFeatureFlags,
      title: 'Personal Chat Mode',
      description: 'Personalized AI personality and responses',
      icon: Brain,
      category: 'AI'
    },
    {
      key: 'enableMorningRoutineTimer' as keyof AIAssistantFeatureFlags,
      title: 'Morning Routine Timer',
      description: '23-minute structured routine with phases',
      icon: Timer,
      category: 'Core'
    },
    {
      key: 'enableVoiceToText' as keyof AIAssistantFeatureFlags,
      title: 'Voice Input',
      description: 'Voice recording and transcription',
      icon: Mic,
      category: 'Input'
    },
    {
      key: 'enableAIProcessing' as keyof AIAssistantFeatureFlags,
      title: 'AI Processing',
      description: 'Groq/OpenAI integration for responses',
      icon: Zap,
      category: 'AI'
    },
    {
      key: 'enableTaskCreation' as keyof AIAssistantFeatureFlags,
      title: 'Task Creation',
      description: 'AI-powered task generation from conversations',
      icon: Settings,
      category: 'Productivity'
    },
    {
      key: 'enableInsightGeneration' as keyof AIAssistantFeatureFlags,
      title: 'Insight Generation',
      description: 'Learning patterns and personalized insights',
      icon: Brain,
      category: 'Learning'
    }
  ];

  const categories = ['Core', 'AI', 'Input', 'Storage', 'Productivity', 'Learning'];
  const enabledCount = Object.values(flags).filter(Boolean).length;

  if (!testingMode) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setTestingMode(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Feature Tests
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-4 z-50 bg-black/50 flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>AI Chat Assistant - Feature Flag Tester</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Development environment only - Toggle features for testing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
                {enabledCount}/8 Enabled
              </Badge>
              <Button
                onClick={() => setTestingMode(false)}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={enableAllFeatures} size="sm" className="bg-green-600 hover:bg-green-700">
              Enable All
            </Button>
            <Button onClick={disableAllFeatures} size="sm" variant="outline">
              Disable All
            </Button>
            <Button onClick={enableCoreFeatures} size="sm" variant="outline">
              Core Features Only
            </Button>
          </div>

          {/* Feature Flags by Category */}
          {categories.map(category => {
            const categoryFlags = flagConfigs.filter(flag => flag.category === category);
            const categoryEnabledCount = categoryFlags.filter(flag => flags[flag.key]).length;
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="outline" className="text-xs">
                    {categoryEnabledCount}/{categoryFlags.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryFlags.map((flagConfig) => {
                    const IconComponent = flagConfig.icon;
                    const isEnabled = flags[flagConfig.key];
                    
                    return (
                      <div
                        key={flagConfig.key}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          isEnabled 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <IconComponent className={`w-5 h-5 mt-0.5 ${
                              isEnabled ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{flagConfig.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {flagConfig.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => 
                              handleFlagChange(flagConfig.key, checked)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Testing Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start with "Core Features Only" for basic functionality</li>
              <li>• Enable "AI Processing" to test Groq/OpenAI integration</li>
              <li>• Enable "Conversation History" to test database operations</li>
              <li>• Check browser console for service initialization logs</li>
              <li>• Use Network tab to monitor API calls</li>
              <li>• Test voice input in a quiet environment first</li>
            </ul>
          </div>

          {/* Current Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(flags, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagTester;