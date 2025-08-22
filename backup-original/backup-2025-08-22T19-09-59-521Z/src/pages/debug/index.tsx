import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, 
  TestTube, 
  Database, 
  Zap, 
  Search,
  Brain,
  FileText,
  Workflow
} from 'lucide-react';
import AppPlanTestingDashboard from '@/components/debug/AppPlanTestingDashboard';
import { MultiStagePromptTester } from '@/components/debug/MultiStagePromptTester';

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Bug className="h-8 w-8 text-orange-500" />
          Development & Testing Hub
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Advanced testing tools for AI prompt systems, database integration, and app plan generation workflows
        </p>
        <Badge variant="outline" className="border-orange-500 text-orange-400">
          🚧 Development Tools - Use with caution in production
        </Badge>
      </div>

      {/* Main Testing Tools */}
      <Tabs defaultValue="multi-stage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900">
          <TabsTrigger 
            value="multi-stage" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500"
          >
            <Workflow className="h-4 w-4 mr-2" />
            Multi-Stage Prompts
          </TabsTrigger>
          <TabsTrigger 
            value="app-plan" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500"
          >
            <Brain className="h-4 w-4 mr-2" />
            App Plan Testing
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500"
          >
            <Database className="h-4 w-4 mr-2" />
            Database Tools
          </TabsTrigger>
        </TabsList>

        {/* Multi-Stage Prompt System */}
        <TabsContent value="multi-stage" className="space-y-6">
          <Card className="bg-gradient-to-r from-gray-950 to-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Search className="h-6 w-6 text-orange-500" />
                Multi-Stage Prompt System
                <Badge className="bg-orange-500 text-white">NEW</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Test the Research → App Plan workflow with structured outputs, Notion-ready formatting, and comprehensive data extraction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Deep Research Phase
                  </h4>
                  <p className="text-sm text-gray-400">
                    Conducts comprehensive market research, competitor analysis, and industry insights
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    App Plan Generation
                  </h4>
                  <p className="text-sm text-gray-400">
                    Creates detailed app development plans based on research insights and client requirements
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Structured Output
                  </h4>
                  <p className="text-sm text-gray-400">
                    Exports Notion-ready markdown with structured data extraction for easy client presentation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <MultiStagePromptTester />
        </TabsContent>

        {/* App Plan Testing */}
        <TabsContent value="app-plan" className="space-y-6">
          <Card className="bg-gradient-to-r from-gray-950 to-black border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Brain className="h-6 w-6 text-blue-500" />
                AI App Plan Testing Dashboard
              </CardTitle>
              <CardDescription className="text-gray-300">
                Test AI prompt strategies, validate structured parsing, and measure generation performance with real-time results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Features</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Custom prompt testing</li>
                    <li>• Structured data parsing validation</li>
                    <li>• Response time measurement</li>
                    <li>• Google Gemini 2.0 Flash integration</li>
                  </ul>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">Outputs</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Raw AI response text</li>
                    <li>• Parsed structured data</li>
                    <li>• Parsing success metrics</li>
                    <li>• Cost analysis (FREE with Gemini)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AppPlanTestingDashboard />
        </TabsContent>

        {/* Database Tools */}
        <TabsContent value="database" className="space-y-6">
          <Card className="bg-gradient-to-r from-gray-950 to-black border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Database className="h-6 w-6 text-green-500" />
                Database & Integration Tools
              </CardTitle>
              <CardDescription className="text-gray-300">
                Monitor Supabase connections, test edge functions, and validate data persistence workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">🚧 Coming Soon</h4>
                  <p className="text-sm text-gray-400">
                    Database testing tools, connection monitoring, and data validation utilities will be available in the next development cycle.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-black border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-400 text-sm">Planned Features</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500">
                      <ul className="space-y-1">
                        <li>• Supabase connection testing</li>
                        <li>• Edge function monitoring</li>
                        <li>• Data migration validation</li>
                        <li>• Real-time subscription testing</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-400 text-sm">Integration Status</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500">
                      <ul className="space-y-1">
                        <li>✅ Google Gemini API</li>
                        <li>✅ Supabase Client</li>
                        <li>🔄 Edge Functions</li>
                        <li>⏳ Database Schemas</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 