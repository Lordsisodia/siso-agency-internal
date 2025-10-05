import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Play, Copy, RefreshCw, Settings, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface TestBusinessData {
  businessName: string;
  appPurpose: string;
  industry: string;
  targetAudience: string;
  budget: string;
  timeline: string;
}

interface TestResult {
  id: string;
  timestamp: string;
  businessData: TestBusinessData;
  prompt: string;
  rawResponse: string;
  structuredPlan: any;
  parseSuccess: boolean;
  responseTime: number;
  costSavings: string;
}

const AppPlanTestingDashboard: React.FC = () => {
  // Testing State
  const [businessData, setBusinessData] = useState<TestBusinessData>({
    businessName: 'TechStart Solutions',
    appPurpose: 'Customer relationship management for small businesses',
    industry: 'Software & Technology',
    targetAudience: 'Small business owners with 10-50 employees',
    budget: '£20,000 - £40,000',
    timeline: '12-16 weeks'
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Predefined test scenarios
  const testScenarios = [
    {
      name: 'E-commerce Startup',
      data: {
        businessName: 'Fashion Forward',
        appPurpose: 'Online fashion marketplace for sustainable clothing',
        industry: 'E-commerce & Retail',
        targetAudience: 'Eco-conscious millennials aged 25-40',
        budget: '£50,000 - £80,000',
        timeline: '16-20 weeks'
      }
    },
    {
      name: 'HealthTech App',
      data: {
        businessName: 'WellnessTrack',
        appPurpose: 'Mental health and wellness tracking platform',
        industry: 'Healthcare & Wellness',
        targetAudience: 'Adults seeking mental health support (18-65)',
        budget: '£30,000 - £60,000',
        timeline: '20-24 weeks'
      }
    },
    {
      name: 'FinTech Solution',
      data: {
        businessName: 'SmartBudget',
        appPurpose: 'Personal finance management and investment tracking',
        industry: 'Financial Services',
        targetAudience: 'Young professionals starting their investment journey',
        budget: '£40,000 - £70,000',
        timeline: '18-22 weeks'
      }
    }
  ];

  // Enhanced prompt templates for testing
  const promptTemplates = [
    {
      name: 'Structured Business Plan',
      prompt: `Create a comprehensive app development plan with the following EXACT structure:

## EXECUTIVE SUMMARY
[2-3 paragraph overview]

## CORE FEATURES (Rank by Priority)
### High Priority Features:
- Feature 1: [Name] - [Description] - [User Story]
- Feature 2: [Name] - [Description] - [User Story]

### Medium Priority Features:
- Feature 3: [Name] - [Description] - [User Story]
- Feature 4: [Name] - [Description] - [User Story]

## TECHNICAL ARCHITECTURE
**Platform Recommendation:** [Native/Cross-platform/Web]
**Tech Stack:**
- Frontend: [Technology]
- Backend: [Technology]
- Database: [Technology]
- APIs: [List key integrations]

## DEVELOPMENT PHASES
### Phase 1: MVP (Weeks 1-8)
- Deliverables: [List]
- Features: [List]

### Phase 2: Enhancement (Weeks 9-16)
- Deliverables: [List]
- Features: [List]

## COST BREAKDOWN (GBP)
- Development: £[amount]
- Design: £[amount]
- Testing: £[amount]
- Total: £[amount]

## TIMELINE: [X] weeks total

Format this as a professional business document.`
    },
    {
      name: 'JSON-Friendly Format',
      prompt: `Respond with a structured app development plan that includes clear sections that can be easily parsed:

START_EXECUTIVE_SUMMARY
[Executive summary content]
END_EXECUTIVE_SUMMARY

START_FEATURES
HIGH_PRIORITY:
- User Authentication and Profile Management
- Core Business Functionality
- Basic Reporting Dashboard

MEDIUM_PRIORITY:
- Advanced Analytics
- Third-party Integrations
- Enhanced User Experience

LOW_PRIORITY:
- AI-powered Features
- Advanced Customization
- Additional Modules
END_FEATURES

START_TECH_STACK
Platform: [recommendation]
Frontend: [technology]
Backend: [technology]
Database: [technology]
END_TECH_STACK

START_COSTS
Development: £[amount]
Design: £[amount]
Testing: £[amount]
Total: £[amount]
END_COSTS

START_TIMELINE
Total Duration: [X weeks]
Phase 1: [weeks] - [deliverables]
Phase 2: [weeks] - [deliverables]
END_TIMELINE

Use this exact format for easy parsing.`
    },
    {
      name: 'Markdown Structured',
      prompt: `Create an app development plan using this EXACT markdown structure:

# APP DEVELOPMENT PLAN: {businessName}

## 📋 EXECUTIVE SUMMARY
{2-3 paragraph executive summary}

## 🚀 CORE FEATURES
### Priority: HIGH
1. **Feature Name** - Description (User Story: As a [user], I want [goal] so that [benefit])
2. **Feature Name** - Description (User Story: As a [user], I want [goal] so that [benefit])

### Priority: MEDIUM
3. **Feature Name** - Description (User Story: As a [user], I want [goal] so that [benefit])
4. **Feature Name** - Description (User Story: As a [user], I want [goal] so that [benefit])

## 🔧 TECHNICAL APPROACH
- **Platform**: [Native iOS/Android | Cross-platform | Progressive Web App]
- **Frontend**: [React Native | Flutter | React]
- **Backend**: [Node.js | Python | .NET]
- **Database**: [PostgreSQL | MongoDB | Firebase]

## 💰 INVESTMENT BREAKDOWN
| Category | Cost (GBP) |
|----------|------------|
| Development | £XX,XXX |
| Design | £X,XXX |
| Testing | £X,XXX |
| **Total** | **£XX,XXX** |

## ⏱️ DELIVERY TIMELINE
**Total Duration**: XX weeks

**Phase 1 (Weeks 1-X)**: MVP Development
- Core features implementation
- Basic UI/UX design
- Initial testing

**Phase 2 (Weeks X-XX)**: Enhancement & Launch
- Advanced features
- Performance optimization
- Production deployment

Use this EXACT format including emojis and markdown structure.`
    }
  ];

  const generateAppPlan = async () => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // Determine which prompt to use
      const finalPrompt = useCustomPrompt && customPrompt.trim() 
        ? customPrompt 
        : promptTemplates[0].prompt; // Default to structured format

      // Call the Supabase edge function
      const { data: result, error } = await supabase.functions.invoke('generate-app-plan', {
        body: {
          businessData,
          options: {
            customPrompt: useCustomPrompt ? customPrompt : undefined,
            testMode: true
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate app plan');
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const testResult: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        businessData: { ...businessData },
        prompt: finalPrompt,
        rawResponse: result.rawResponse || 'No response received',
        structuredPlan: result.generatedPlan || {},
        parseSuccess: result.success || false,
        responseTime,
        costSavings: result.costSavings || 'FREE - Google Gemini'
      };

      setTestResults(prev => [testResult, ...prev]);
      setSelectedResult(testResult);

    } catch (error) {
      console.error('Testing error:', error);
      const testResult: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        businessData: { ...businessData },
        prompt: useCustomPrompt ? customPrompt : promptTemplates[0].prompt,
        rawResponse: `Error: ${error instanceof Error ? error.message : String(error)}

⚠️  Troubleshooting Tips:
- Check if the Supabase project is connected properly
- Verify the Google API key is set in Supabase secrets
- Ensure the edge function is deployed

🔧 Technical Details:
${error instanceof Error ? error.stack || 'No stack trace available' : 'Unknown error type'}`,
        structuredPlan: { error: 'Failed to generate plan due to API error' },
        parseSuccess: false,
        responseTime: Date.now() - startTime,
        costSavings: 'FREE - Google Gemini'
      };
      setTestResults(prev => [testResult, ...prev]);
      setSelectedResult(testResult);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadTestScenario = (scenario: typeof testScenarios[0]) => {
    setBusinessData(scenario.data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 AI App Plan Testing Dashboard
          </h1>
          <p className="text-gray-300">
            Test different prompts and client scenarios with Google Gemini to optimize app plan generation
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="bg-green-900 text-green-100">
              <Zap className="w-3 h-3 mr-1" />
              Google Gemini 2.0 Flash (FREE)
            </Badge>
            <Badge variant="secondary" className="bg-blue-900 text-blue-100">
              100% Cost Savings vs OpenAI
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input Configuration */}
          <div className="space-y-6">
            {/* Business Data Input */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Client Business Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Test Scenarios */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Quick Test Scenarios</Label>
                  <div className="flex flex-wrap gap-2">
                    {testScenarios.map((scenario, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadTestScenario(scenario)}
                        className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                      >
                        {scenario.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Business Data Form */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-gray-300">Business Name</Label>
                    <Input
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">App Purpose</Label>
                    <Textarea
                      value={businessData.appPurpose}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, appPurpose: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Industry</Label>
                      <Input
                        value={businessData.industry}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, industry: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Target Audience</Label>
                      <Input
                        value={businessData.targetAudience}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Budget</Label>
                      <Input
                        value={businessData.budget}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, budget: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Timeline</Label>
                      <Input
                        value={businessData.timeline}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, timeline: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Configuration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Prompt Engineering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger 
                      value="templates" 
                      className="data-[state=active]:bg-gray-600 text-gray-200"
                      onClick={() => setUseCustomPrompt(false)}
                    >
                      Templates
                    </TabsTrigger>
                    <TabsTrigger 
                      value="custom" 
                      className="data-[state=active]:bg-gray-600 text-gray-200"
                      onClick={() => setUseCustomPrompt(true)}
                    >
                      Custom
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="space-y-3">
                    {promptTemplates.map((template, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600"
                        onClick={() => {
                          setCustomPrompt(template.prompt);
                          setUseCustomPrompt(false);
                        }}
                      >
                        <h4 className="font-medium text-white mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {template.prompt.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom prompt here..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateAppPlan}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate App Plan (FREE)
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Test Results History */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Test Results History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {testResults.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      No test results yet. Generate your first app plan!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testResults.map((result) => (
                        <div
                          key={result.id}
                          className={`p-3 rounded-lg border cursor-pointer ${
                            selectedResult?.id === result.id
                              ? 'bg-blue-900 border-blue-600'
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white text-sm">
                              {result.businessData.businessName}
                            </h4>
                            <div className="flex gap-1">
                              <Badge
                                variant={result.parseSuccess ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {result.parseSuccess ? 'Success' : 'Failed'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mb-1">
                            {result.businessData.industry}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                            <span>{result.responseTime}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Selected Result Details */}
            {selectedResult && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Result Analysis
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedResult.rawResponse)}
                        className="bg-gray-700 border-gray-600 text-gray-200"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Raw
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="structured" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                      <TabsTrigger value="structured" className="data-[state=active]:bg-gray-600 text-gray-200">
                        Structured
                      </TabsTrigger>
                      <TabsTrigger value="raw" className="data-[state=active]:bg-gray-600 text-gray-200">
                        Raw Response
                      </TabsTrigger>
                      <TabsTrigger value="prompt" className="data-[state=active]:bg-gray-600 text-gray-200">
                        Prompt Used
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="structured" className="mt-4">
                      <ScrollArea className="h-[400px]">
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(selectedResult.structuredPlan, null, 2)}
                          </pre>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="raw" className="mt-4">
                      <ScrollArea className="h-[400px]">
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <div className="text-sm text-gray-300 whitespace-pre-wrap">
                            {selectedResult.rawResponse}
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="prompt" className="mt-4">
                      <ScrollArea className="h-[400px]">
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <div className="text-sm text-gray-300 whitespace-pre-wrap">
                            {selectedResult.prompt}
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>

                  {/* Performance Metrics */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Response Time</div>
                      <div className="text-lg font-bold text-white">{selectedResult.responseTime}ms</div>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Cost</div>
                      <div className="text-lg font-bold text-green-400">FREE</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Usage Tips */}
        <Alert className="mt-8 bg-blue-900 border-blue-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-100">
            <strong>💡 Testing Tips:</strong> Try different prompt templates to see how Gemini structures responses. 
            Use the "JSON-Friendly" template for easier parsing, or "Markdown Structured" for beautiful formatting.
            The structured data shows how well the parsing worked!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AppPlanTestingDashboard; 