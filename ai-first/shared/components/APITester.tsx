import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Zap,
  Mic,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';
import { 
  APITestResult,
  testGroqAPI,
  testOpenAIAPI,
  testSupabaseConnection,
  testWebSpeechAPI,
  testVoiceProcessingPipeline,
  runAllAPITests,
  generateSetupInstructions
} from '../utils/api-testing.utils';

interface APITesterProps {
  className?: string;
}

/**
 * API Testing Interface
 * Comprehensive testing interface for AI chat assistant API integrations
 */
export const APITester: React.FC<APITesterProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const testConfigs = [
    {
      name: 'Web Speech API',
      description: 'Voice recognition and browser support',
      icon: Mic,
      test: testWebSpeechAPI,
      color: 'blue'
    },
    {
      name: 'Groq API',
      description: 'Groq AI integration and authentication',
      icon: Zap,
      test: testGroqAPI,
      color: 'green'
    },
    {
      name: 'OpenAI API',
      description: 'OpenAI integration (optional)',
      icon: Zap,
      test: testOpenAIAPI,
      color: 'purple'
    },
    {
      name: 'Supabase',
      description: 'Database connection and authentication',
      icon: Database,
      test: testSupabaseConnection,
      color: 'orange'
    },
    {
      name: 'Voice Pipeline',
      description: 'End-to-end voice processing workflow',
      icon: Settings,
      test: () => testVoiceProcessingPipeline(),
      color: 'red'
    }
  ];

  const runSingleTest = async (testName: string, testFunction: () => Promise<APITestResult>) => {
    setRunningTest(testName);
    try {
      const result = await testFunction();
      setTestResults(prev => {
        const filtered = prev.filter(r => r.service !== testName);
        return [...filtered, result];
      });
    } catch (error) {
      setTestResults(prev => {
        const filtered = prev.filter(r => r.service !== testName);
        return [...filtered, {
          service: testName,
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }];
      });
    } finally {
      setRunningTest(null);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    try {
      const results = await runAllAPITests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run all tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getTestResult = (serviceName: string): APITestResult | undefined => {
    return testResults.find(r => r.service === serviceName);
  };

  const getStatusIcon = (serviceName: string) => {
    const result = getTestResult(serviceName);
    if (runningTest === serviceName) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (!result) {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
    return result.success 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (serviceName: string) => {
    const result = getTestResult(serviceName);
    if (runningTest === serviceName) {
      return <Badge variant="outline" className="text-blue-600">Running...</Badge>;
    }
    if (!result) {
      return <Badge variant="secondary">Not Tested</Badge>;
    }
    return result.success 
      ? <Badge className="bg-green-100 text-green-800">Pass</Badge>
      : <Badge variant="destructive">Fail</Badge>;
  };

  const successfulTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;
  const overallProgress = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

  const copySetupInstructions = () => {
    navigator.clipboard.writeText(generateSetupInstructions());
    // Could add a toast notification here
  };

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
        >
          <Settings className="w-4 h-4 mr-2" />
          API Tests
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-4 z-50 bg-black/50 flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>AI Chat Assistant - API Integration Testing</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Test all API connections and integrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalTests > 0 && (
                <Badge variant={successfulTests === totalTests ? "default" : "secondary"}>
                  {successfulTests}/{totalTests} Pass
                </Badge>
              )}
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          {totalTests > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Test Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run All Tests
            </Button>
            <Button 
              onClick={() => setShowSetupInstructions(!showSetupInstructions)}
              variant="outline"
            >
              Setup Instructions
            </Button>
            <Button 
              onClick={copySetupInstructions}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Setup
            </Button>
          </div>

          {/* Setup Instructions */}
          {showSetupInstructions && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Environment Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Required Services</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <a href="https://console.groq.com/" target="_blank" className="text-blue-600 hover:underline">Groq API <ExternalLink className="w-3 h-3 inline ml-1" /></a> (Free tier)</li>
                        <li>• <a href="https://supabase.com/" target="_blank" className="text-blue-600 hover:underline">Supabase <ExternalLink className="w-3 h-3 inline ml-1" /></a> (Free tier)</li>
                        <li>• <a href="https://platform.openai.com/" target="_blank" className="text-blue-600 hover:underline">OpenAI API <ExternalLink className="w-3 h-3 inline ml-1" /></a> (Optional)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Environment Variables</h4>
                      <code className="text-xs bg-white p-2 rounded block">
                        GROQ_API_KEY=gsk_...<br/>
                        SUPABASE_URL=https://...<br/>
                        SUPABASE_ANON_KEY=eyJ...<br/>
                        OPENAI_API_KEY=sk_... (optional)
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testConfigs.map((config) => {
              const IconComponent = config.icon;
              const result = getTestResult(config.name);
              const isCurrentlyRunning = runningTest === config.name;
              
              return (
                <Card key={config.name} className={`transition-colors ${
                  result?.success ? 'border-green-200 bg-green-50' : 
                  result?.success === false ? 'border-red-200 bg-red-50' : 
                  'border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 text-${config.color}-600`} />
                        <div>
                          <h4 className="font-medium">{config.name}</h4>
                          <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(config.name)}
                        {getStatusBadge(config.name)}
                      </div>
                    </div>

                    {/* Test Results */}
                    {result && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Response Time:</span>
                          <span className="font-mono">{result.responseTime}ms</span>
                        </div>
                        
                        {result.error && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                        
                        {result.data && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600">View Response Data</summary>
                            <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Individual Test Button */}
                    <Button
                      onClick={() => runSingleTest(config.name, config.test)}
                      disabled={isCurrentlyRunning || isRunning}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      {isCurrentlyRunning ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Test {config.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Results Summary */}
          {testResults.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{successfulTests}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{totalTests - successfulTests}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length)}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APITester;