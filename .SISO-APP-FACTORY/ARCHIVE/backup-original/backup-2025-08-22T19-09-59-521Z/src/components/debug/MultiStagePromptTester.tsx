/**
 * Multi-Stage Prompt System Tester - Three Stage Workflow
 * Tests the Initial Research → Refined Research → App Plan workflow
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, FileText, Copy, Download, Play, Eye, TrendingUp, Brain } from 'lucide-react';
import { 
  multiStagePromptSystem, 
  ResearchPromptInput, 
  InitialResearchReport,
  RefinedResearchReport,
  AppPlanOutput 
} from '@/services/multiStagePromptSystem';
import { AppPlanInput } from '@/types/appPlan.types';

interface ThreeStageTestResults {
  initialResearch?: InitialResearchReport;
  refinedResearch?: RefinedResearchReport;
  appPlan?: AppPlanOutput;
  executionTime: number;
  stage: 'idle' | 'initial-research' | 'refined-research' | 'app-plan' | 'complete' | 'error';
  currentProgress: number;
  currentMessage: string;
}

export function MultiStagePromptTester() {
  const [researchInput, setResearchInput] = useState<ResearchPromptInput>({
    companyName: "Ty's Juice Bar",
    industry: "Food & Beverage (Health & Wellness)",
    location: "N8 8DU, London",
    productsServices: "premium juices, smoothies, wellness shots",
    targetUsers: "Health-conscious individuals, ages 18-45"
  });

  const [appPlanInput, setAppPlanInput] = useState<AppPlanInput>({
    businessName: "Ty's Juice Bar",
    appPurpose: "Mobile app to streamline ordering and enhance customer engagement",
    industry: "Food & Beverage",
    targetAudience: "Health-conscious individuals",
    budget: "$500-$2,500",
    timeline: "30 days"
  });

  const [testResults, setTestResults] = useState<ThreeStageTestResults>({
    executionTime: 0,
    stage: 'idle',
    currentProgress: 0,
    currentMessage: ''
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedView, setSelectedView] = useState<'inputs' | 'initial' | 'refined' | 'plan' | 'structured'>('inputs');

  const executeThreeStageWorkflow = async () => {
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      const result = await multiStagePromptSystem.executeThreeStageWorkflow(
        researchInput,
        appPlanInput,
        (stage, progress, message) => {
          setTestResults(prev => ({
            ...prev,
            stage: stage as any,
            currentProgress: progress,
            currentMessage: message
          }));
        }
      );

      const executionTime = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        initialResearch: result.initialResearch,
        refinedResearch: result.refinedResearch,
        appPlan: result.appPlan,
        executionTime,
        stage: 'complete',
        currentProgress: 100,
        currentMessage: 'Three-stage process completed successfully!'
      }));

      toast({
        title: "🎉 Three-Stage Process Complete!",
        description: `Generated complete research workflow and app plan in ${(executionTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setTestResults(prev => ({
        ...prev,
        stage: 'error',
        currentMessage: errorMessage
      }));

      toast({
        title: "❌ Three-Stage Process Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeInitialResearchOnly = async () => {
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      setTestResults(prev => ({
        ...prev,
        stage: 'initial-research',
        currentProgress: 50,
        currentMessage: 'Conducting initial market research...'
      }));

      const initialResearch = await multiStagePromptSystem.executeInitialResearch(researchInput);
      const executionTime = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        initialResearch,
        executionTime,
        stage: 'complete',
        currentProgress: 100,
        currentMessage: 'Initial research phase completed!'
      }));

      toast({
        title: "🔍 Initial Research Complete!",
        description: `Generated initial research report in ${(executionTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setTestResults(prev => ({
        ...prev,
        stage: 'error',
        currentMessage: errorMessage
      }));

      toast({
        title: "❌ Initial Research Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeRefinedResearchOnly = async () => {
    if (!testResults.initialResearch) {
      toast({
        title: "⚠️ Missing Initial Research",
        description: "Please run initial research first",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      setTestResults(prev => ({
        ...prev,
        stage: 'refined-research',
        currentProgress: 50,
        currentMessage: 'Conducting refined research analysis...'
      }));

      const refinedResearch = await multiStagePromptSystem.executeRefinedResearch(researchInput, testResults.initialResearch);
      const executionTime = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        refinedResearch,
        executionTime,
        stage: 'complete',
        currentProgress: 100,
        currentMessage: 'Refined research phase completed!'
      }));

      toast({
        title: "🎯 Refined Research Complete!",
        description: `Generated refined research report in ${(executionTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setTestResults(prev => ({
        ...prev,
        stage: 'error',
        currentMessage: errorMessage
      }));

      toast({
        title: "❌ Refined Research Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAppPlanOnly = async () => {
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      setTestResults(prev => ({
        ...prev,
        stage: 'app-plan',
        currentProgress: 50,
        currentMessage: 'Generating comprehensive app plan...'
      }));

      const appPlan = await multiStagePromptSystem.executeAppPlan(appPlanInput, undefined, testResults.refinedResearch);
      const executionTime = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        appPlan,
        executionTime,
        stage: 'complete',
        currentProgress: 100,
        currentMessage: 'App plan generation completed!'
      }));

      toast({
        title: "📱 App Plan Complete!",
        description: `Generated app development plan in ${(executionTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setTestResults(prev => ({
        ...prev,
        stage: 'error',
        currentMessage: errorMessage
      }));

      toast({
        title: "❌ App Plan Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied to Clipboard",
      description: `${label} copied successfully - ready for Notion!`,
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 Downloaded",
      description: `${filename} downloaded successfully!`,
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'initial-research': return 'bg-blue-500';
      case 'refined-research': return 'bg-purple-500';
      case 'app-plan': return 'bg-green-500';
      case 'complete': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'initial-research': return <Search className="h-4 w-4" />;
      case 'refined-research': return <TrendingUp className="h-4 w-4" />;
      case 'app-plan': return <Brain className="h-4 w-4" />;
      case 'complete': return <Eye className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-950 to-black border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            <Search className="h-6 w-6 text-orange-500" />
            Three-Stage Research & Development System
          </CardTitle>
          <CardDescription className="text-gray-300">
            Initial Research → Refined Research → App Plan workflow with comprehensive analysis and Notion-ready outputs
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stage Progress Indicator */}
      <Card className="bg-black border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Workflow Progress</h3>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              Three-Stage System
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Stage 1 */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              testResults.stage === 'initial-research' ? 'bg-blue-500/20 border border-blue-500/50' : 
              testResults.initialResearch ? 'bg-green-500/20 border border-green-500/50' : 
              'bg-gray-800/50 border border-gray-600/50'
            }`}>
              <Search className={`h-4 w-4 ${testResults.initialResearch ? 'text-green-400' : 'text-blue-400'}`} />
              <span className={`text-sm font-medium ${testResults.initialResearch ? 'text-green-400' : 'text-blue-400'}`}>
                Initial Research
              </span>
            </div>

            <div className={`h-0.5 w-8 transition-all ${testResults.initialResearch ? 'bg-green-500' : 'bg-gray-600'}`} />

            {/* Stage 2 */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              testResults.stage === 'refined-research' ? 'bg-purple-500/20 border border-purple-500/50' : 
              testResults.refinedResearch ? 'bg-green-500/20 border border-green-500/50' : 
              'bg-gray-800/50 border border-gray-600/50'
            }`}>
              <TrendingUp className={`h-4 w-4 ${testResults.refinedResearch ? 'text-green-400' : 'text-purple-400'}`} />
              <span className={`text-sm font-medium ${testResults.refinedResearch ? 'text-green-400' : 'text-purple-400'}`}>
                Refined Research
              </span>
            </div>

            <div className={`h-0.5 w-8 transition-all ${testResults.refinedResearch ? 'bg-green-500' : 'bg-gray-600'}`} />

            {/* Stage 3 */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              testResults.stage === 'app-plan' ? 'bg-green-500/20 border border-green-500/50' : 
              testResults.appPlan ? 'bg-green-500/20 border border-green-500/50' : 
              'bg-gray-800/50 border border-gray-600/50'
            }`}>
              <Brain className={`h-4 w-4 ${testResults.appPlan ? 'text-green-400' : 'text-orange-400'}`} />
              <span className={`text-sm font-medium ${testResults.appPlan ? 'text-green-400' : 'text-orange-400'}`}>
                App Plan
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {isExecuting && (
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>{testResults.currentMessage}</span>
                    <span>{testResults.currentProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStageColor(testResults.stage)}`}
                      style={{ width: `${testResults.currentProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid w-full grid-cols-5 bg-gray-900">
          <TabsTrigger value="inputs" className="text-white data-[state=active]:bg-orange-500">
            Input Config
          </TabsTrigger>
          <TabsTrigger value="initial" className="text-white data-[state=active]:bg-blue-500">
            Initial Research
          </TabsTrigger>
          <TabsTrigger value="refined" className="text-white data-[state=active]:bg-purple-500">
            Refined Research
          </TabsTrigger>
          <TabsTrigger value="plan" className="text-white data-[state=active]:bg-green-500">
            App Plan
          </TabsTrigger>
          <TabsTrigger value="structured" className="text-white data-[state=active]:bg-gray-600">
            Data View
          </TabsTrigger>
        </TabsList>

        {/* Input Configuration Tab */}
        <TabsContent value="inputs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Research Input */}
            <Card className="bg-black border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Research Input
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure the research parameters for both stages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Company Name"
                  value={researchInput.companyName}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Industry"
                  value={researchInput.industry}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, industry: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Location"
                  value={researchInput.location}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Textarea
                  placeholder="Products/Services"
                  value={researchInput.productsServices}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, productsServices: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Textarea
                  placeholder="Target Users"
                  value={researchInput.targetUsers}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, targetUsers: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </CardContent>
            </Card>

            {/* App Plan Input */}
            <Card className="bg-black border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  App Plan Input
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure the app development plan parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Business Name"
                  value={appPlanInput.businessName}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, businessName: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Textarea
                  placeholder="App Purpose"
                  value={appPlanInput.appPurpose}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, appPurpose: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Industry"
                  value={appPlanInput.industry}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, industry: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Target Audience"
                  value={appPlanInput.targetAudience}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Budget"
                  value={appPlanInput.budget || ''}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, budget: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  placeholder="Timeline"
                  value={appPlanInput.timeline || ''}
                  onChange={(e) => setAppPlanInput(prev => ({ ...prev, timeline: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </CardContent>
            </Card>
          </div>

          {/* Execution Controls */}
          <Card className="bg-black border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={executeThreeStageWorkflow}
                  disabled={isExecuting}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Full Three-Stage Workflow
                </Button>
                
                <Separator orientation="vertical" className="h-8" />
                
                <Button 
                  onClick={executeInitialResearchOnly}
                  disabled={isExecuting}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Stage 1: Initial Research
                </Button>
                <Button 
                  onClick={executeRefinedResearchOnly}
                  disabled={isExecuting || !testResults.initialResearch}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white disabled:opacity-50"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stage 2: Refined Research
                </Button>
                <Button 
                  onClick={executeAppPlanOnly}
                  disabled={isExecuting}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Stage 3: App Plan
                </Button>
              </div>
              
              {testResults.executionTime > 0 && (
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    ⏱️ {(testResults.executionTime / 1000).toFixed(1)}s
                  </Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    🎯 Google Gemini 2.0 Flash (FREE)
                  </Badge>
                  <Badge variant="outline" className="border-orange-500 text-orange-400">
                    🔄 Three-Stage System
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initial Research Tab */}
        <TabsContent value="initial" className="space-y-4">
          {testResults.initialResearch ? (
            <Card className="bg-black border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Initial Research Report for {testResults.initialResearch.companyName}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(testResults.initialResearch!.rawMarkdown, 'Initial Research Report')}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Markdown
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(
                        testResults.initialResearch!.rawMarkdown, 
                        `${testResults.initialResearch!.companyName.replace(/\s+/g, '_')}_initial_research.md`
                      )}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Stage 1: Initial market research and competitor landscape analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {testResults.initialResearch.rawMarkdown}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No initial research generated yet. Run Stage 1 to see results.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Refined Research Tab */}
        <TabsContent value="refined" className="space-y-4">
          {testResults.refinedResearch ? (
            <Card className="bg-black border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Refined Research Report for {testResults.refinedResearch.companyName}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(testResults.refinedResearch!.rawMarkdown, 'Refined Research Report')}
                      className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Markdown
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(
                        testResults.refinedResearch!.rawMarkdown, 
                        `${testResults.refinedResearch!.companyName.replace(/\s+/g, '_')}_refined_research.md`
                      )}
                      className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Stage 2: Deep analysis and strategic recommendations based on initial research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {testResults.refinedResearch.rawMarkdown}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No refined research generated yet. Run Stage 2 to see results.</p>
                {!testResults.initialResearch && (
                  <p className="text-red-400 text-sm mt-2">Initial research must be completed first.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* App Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          {testResults.appPlan ? (
            <Card className="bg-black border-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    App Development Plan for {testResults.appPlan.companyName}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(testResults.appPlan!.rawMarkdown, 'App Plan')}
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Markdown
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(
                        testResults.appPlan!.rawMarkdown, 
                        `${testResults.appPlan!.companyName.replace(/\s+/g, '_')}_app_plan.md`
                      )}
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Stage 3: Research-backed app development plan ready for client delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {testResults.appPlan.rawMarkdown}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="p-12 text-center">
                <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No app plan generated yet. Run Stage 3 to see results.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Structured Data Tab */}
        <TabsContent value="structured" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Initial Research Data */}
            {testResults.initialResearch && (
              <Card className="bg-black border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Initial Research Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-blue-300 font-medium mb-2">Industry Overview</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Key Trends:</strong> {testResults.initialResearch.industryOverview.keyTrends.join(', ')}</p>
                        <p><strong>Growth Drivers:</strong> {testResults.initialResearch.industryOverview.growthDrivers.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-blue-300 font-medium mb-2">Competitors</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Direct:</strong> {testResults.initialResearch.competitorLandscape.directCompetitors.length} found</p>
                        <p><strong>Indirect:</strong> {testResults.initialResearch.competitorLandscape.indirectCompetitors.length} found</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Refined Research Data */}
            {testResults.refinedResearch && (
              <Card className="bg-black border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Refined Research Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-purple-300 font-medium mb-2">Strategic Analysis</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Opportunities:</strong> {testResults.refinedResearch.deepMarketAnalysis.validatedOpportunities.length} validated</p>
                        <p><strong>Risks:</strong> {testResults.refinedResearch.deepMarketAnalysis.riskAssessment.length} identified</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-purple-300 font-medium mb-2">Technical Considerations</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Integrations:</strong> {testResults.refinedResearch.technicalConsiderations.requiredIntegrations.length} required</p>
                        <p><strong>Platform:</strong> {testResults.refinedResearch.technicalConsiderations.platformConsiderations.length} considerations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* App Plan Data */}
            {testResults.appPlan && (
              <Card className="bg-black border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    App Plan Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-green-300 font-medium mb-2">Features</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Essential:</strong> {testResults.appPlan.features.essential.length} features</p>
                        <p><strong>Add-ons:</strong> {testResults.appPlan.features.additionalAddOns.length} features</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-green-300 font-medium mb-2">Project Details</h4>
                      <div className="bg-gray-900 p-3 rounded border border-gray-700">
                        <p><strong>Budget:</strong> {testResults.appPlan.budget.estimatedCost}</p>
                        <p><strong>Timeline:</strong> {testResults.appPlan.timeline.totalDuration}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 