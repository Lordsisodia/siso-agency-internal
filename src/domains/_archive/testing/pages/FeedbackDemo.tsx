import React from 'react';
import { CleanFeedbackManager } from '@/domains/testing/components/feedback';
import { SimpleFeedbackList } from '@/domains/testing/components/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { feedbackService } from '@/services/feedbackService';

interface FeedbackItem {
  id: string;
  title?: string;
  description?: string;
  text?: string;
  type?: 'bug' | 'suggestion' | 'improvement' | 'complaint' | 'praise';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  submitted: boolean;
}

export default function FeedbackDemo() {
  const handleSubmitFeedback = async (items: FeedbackItem[]) => {
    // Handle both simple text items and complex items
    for (const item of items) {
      try {
        await feedbackService.createFeedback({
          title: item.title || item.text || 'User Feedback',
          description: item.description || item.text || '',
          category: 'GENERAL',
          feedbackType: (item.type || 'SUGGESTION').toUpperCase() as any,
          priority: (item.priority || 'MEDIUM').toUpperCase() as any,
          page: '/feedback-demo',
        }, navigator.userAgent, `${screen.width}x${screen.height}`);
      } catch (error) {
        console.error('Failed to submit feedback item:', error);
        throw error;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Feedback UI Options
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Choose the feedback style that works best for you
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Simple List Version - RECOMMENDED */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                  <h3 className="text-lg font-semibold">Simple List</h3>
                </div>
                <SimpleFeedbackList 
                  title="Quick Feedback"
                  onSubmit={handleSubmitFeedback} 
                />
              </div>

              {/* Complex Manager Version */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Advanced</Badge>
                  <h3 className="text-lg font-semibold">Detailed Manager</h3>
                </div>
                <CleanFeedbackManager onSubmit={handleSubmitFeedback} />
              </div>
              
              {/* Features Showcase */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">✨ Simple List Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Just type and press Enter (like tasks)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>No complicated forms or steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Clean list view with simple pills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Batch submit all at once</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Local storage until submitted</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">💬 Simple Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="bg-white/70 rounded px-2 py-1 text-xs">
                      "Login button not working on mobile"
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1 text-xs">
                      "Add dark mode please"
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1 text-xs">
                      "Search is too slow"
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1 text-xs">
                      "Love the new design!"
                    </div>
                    <div className="bg-white/70 rounded px-2 py-1 text-xs">
                      "Menu is confusing"
                    </div>
                    <p className="text-xs text-gray-500 pt-2 italic">
                      Just type whatever comes to mind ↑
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-800">🔧 Developer Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <p className="text-gray-600">
                      This component uses the same patterns as your task management components:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                      <li>Local storage for persistence</li>
                      <li>Animated add/remove interactions</li>
                      <li>Clean input forms with validation</li>
                      <li>Badge-based status indicators</li>
                      <li>Responsive grid layouts</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}