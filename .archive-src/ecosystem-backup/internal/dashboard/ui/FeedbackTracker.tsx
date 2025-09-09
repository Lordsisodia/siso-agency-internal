/**
 * Feedback Tracker Component
 * Displays logged user feedback and issue status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  AlertTriangle, 
  Flame, 
  AlertCircle, 
  Lightbulb,
  CheckCircle2,
  Clock,
  Play,
  X,
  Brain,
  Target,
  TestTube
} from 'lucide-react';
import { feedbackPredictor } from '@/services/data/feedbackPredictor';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'database' | 'mobile' | 'ui' | 'backend' | 'feature';
  status: 'not-started' | 'in-progress' | 'testing' | 'completed' | 'wont-fix';
  dateLogged: string;
  platform: string;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: '1',
    title: 'Task persistence failure on mobile',
    description: 'Tasks created last night didn\'t save to Prisma database in production',
    severity: 'critical',
    category: 'database',
    status: 'not-started',
    dateLogged: '2025-01-09',
    platform: 'iPhone PWA'
  },
  {
    id: '2', 
    title: 'Light Focus Work section not clickable on mobile',
    description: 'Can\'t click, interact with inputs, or submit forms in light focus work section',
    severity: 'high',
    category: 'mobile',
    status: 'not-started', 
    dateLogged: '2025-01-09',
    platform: 'iPhone PWA'
  },
  {
    id: '3',
    title: 'Workout objectives non-interactive on mobile',
    description: 'Same touch interaction problems as light focus work - can\'t click or enter data',
    severity: 'high',
    category: 'mobile', 
    status: 'not-started',
    dateLogged: '2025-01-09',
    platform: 'iPhone PWA'
  },
  {
    id: '4',
    title: 'Wake up time displays 6 PM as 6 AM',
    description: 'Time format conversion bug - 24-hour backend shows incorrectly in 12-hour frontend',
    severity: 'medium',
    category: 'ui',
    status: 'not-started',
    dateLogged: '2025-01-09', 
    platform: 'Mobile PWA'
  },
  {
    id: '5',
    title: 'Morning routine missing day selector',
    description: 'Day context disappeared from morning routine after refactoring',
    severity: 'medium',
    category: 'ui',
    status: 'not-started',
    dateLogged: '2025-01-09',
    platform: 'Mobile PWA'
  },
  {
    id: '6',
    title: 'Daily wisdom needs more quotes and attribution',
    description: 'Expand from 1 quote to 3-5 quotes with author names',
    severity: 'low',
    category: 'feature',
    status: 'not-started',
    dateLogged: '2025-01-09',
    platform: 'Mobile PWA'
  }
];

export function FeedbackTracker() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showPredicted, setShowPredicted] = useState<boolean>(true);
  const [showTestingChecklist, setShowTestingChecklist] = useState<boolean>(false);
  const [predictedIssues, setPredictedIssues] = useState<any[]>([]);
  const [testingChecklist, setTestingChecklist] = useState<string[]>([]);

  useEffect(() => {
    // Load known issues and generate predictions
    feedbackPredictor.loadFromFeedback();
    const predictions = feedbackPredictor.predictIssues();
    setPredictedIssues(predictions);
    
    // Generate testing checklist
    const checklist = feedbackPredictor.generateTestingChecklist(predictions);
    setTestingChecklist(checklist);
  }, []);

  const getSeverityIcon = (severity: FeedbackItem['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: FeedbackItem['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-500" />;
      case 'testing': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'wont-fix': return <X className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'testing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'wont-fix': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredFeedback = mockFeedback.filter(item => {
    const severityMatch = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return severityMatch && statusMatch;
  });

  const criticalCount = mockFeedback.filter(item => item.severity === 'critical').length;
  const highCount = mockFeedback.filter(item => item.severity === 'high').length;
  const highConfidencePredictions = predictedIssues.filter(pred => pred.confidence >= 80).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          User Feedback Tracker
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="destructive">{criticalCount} Critical</Badge>
          <Badge variant="secondary">{highCount} High Priority</Badge>
          <Badge variant="outline">{mockFeedback.length} Total Issues</Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-3 w-3 mr-1" />
            {highConfidencePredictions} Predicted
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 text-sm flex-wrap">
            <div>
              <label className="font-medium mb-1 block">Severity:</label>
              <select 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="font-medium mb-1 block">Status:</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="font-medium mb-1 block">View:</label>
              <div className="flex gap-1">
                <Button
                  variant={showPredicted ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPredicted(!showPredicted)}
                  className="h-8"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Predictions
                </Button>
                <Button
                  variant={showTestingChecklist ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTestingChecklist(!showTestingChecklist)}
                  className="h-8"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Tests
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-3">
            {filteredFeedback.map((item) => (
              <div 
                key={item.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(item.severity)}
                    <h3 className="font-medium">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(item.status)}
                    >
                      {item.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <Badge 
                    variant="outline" 
                    className={getSeverityColor(item.severity)}
                  >
                    {item.severity}
                  </Badge>
                  <span>📱 {item.platform}</span>
                  <span>📅 {item.dateLogged}</span>
                  <span>🏷️ {item.category}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No feedback items match the selected filters.
            </div>
          )}
          
          {/* Predicted Issues Section */}
          {showPredicted && predictedIssues.length > 0 && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">AI-Predicted Issues</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {predictedIssues.length} predictions
                </Badge>
              </div>
              
              {predictedIssues.map((prediction) => (
                <div 
                  key={prediction.id}
                  className="p-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">{prediction.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        {prediction.confidence}% confidence
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(prediction.severity)}>
                        {prediction.severity}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-700 mb-2">{prediction.predictedSymptom}</p>
                  <p className="text-xs text-purple-600 italic mb-3">{prediction.reasoning}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-purple-800">Suggested Testing:</p>
                    {prediction.testSteps.slice(0, 3).map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-purple-600">
                        <TestTube className="h-3 w-3" />
                        {step}
                      </div>
                    ))}
                    {prediction.testSteps.length > 3 && (
                      <p className="text-xs text-purple-500">+{prediction.testSteps.length - 3} more steps...</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-purple-600">
                    <span>🏷️ {prediction.category}</span>
                    <span>🎯 {prediction.component}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Testing Checklist Section */}
          {showTestingChecklist && testingChecklist.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <TestTube className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Generated Testing Checklist</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {testingChecklist.length} items
                </Badge>
              </div>
              
              <div className="p-4 border rounded-lg bg-blue-50/30 max-h-96 overflow-y-auto">
                <div className="space-y-1 text-sm">
                  {testingChecklist.map((item, idx) => {
                    if (item.startsWith('##')) {
                      return (
                        <h4 key={idx} className="font-semibold text-blue-900 mt-4 first:mt-0">
                          {item.replace('##', '').trim()}
                        </h4>
                      );
                    } else if (item.startsWith('- [ ]')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 ml-2">
                          <input type="checkbox" className="mt-0.5" />
                          <span className="text-blue-700">{item.replace('- [ ]', '').trim()}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}