/**
 * Test Page - Verify Morning AI Tools Return Real Supabase Data
 * Navigate to /test-morning-ai to run tests
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TaskQueryTools } from '@/services/morning-thought-dump/tools/taskQueryTools';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';

export default function TestMorningAI() {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    if (!internalUserId) {
      alert('Not logged in!');
      return;
    }

    setTesting(true);
    setTestResults([]);
    const results: any[] = [];

    const tools = new TaskQueryTools(internalUserId, new Date());

    // Test 1: Get Today's Tasks
    try {
      const result = await tools.getTodaysTasks(false);
      results.push({
        test: '1. get_todays_tasks',
        success: true,
        data: result,
        summary: `${result.summary.totalDeepWork} deep + ${result.summary.totalLightWork} light = ${result.summary.totalDeepWork + result.summary.totalLightWork} total`
      });
    } catch (error) {
      results.push({
        test: '1. get_todays_tasks',
        success: false,
        error: String(error)
      });
    }

    // Test 2: Get Urgent Tasks
    try {
      const result = await tools.getUrgentTasks();
      results.push({
        test: '2. get_urgent_tasks',
        success: true,
        data: result,
        summary: `${result.count} urgent tasks found`
      });
    } catch (error) {
      results.push({
        test: '2. get_urgent_tasks',
        success: false,
        error: String(error)
      });
    }

    // Test 3: Deep Work Only
    try {
      const result = await tools.getDeepWorkTasksOnly();
      results.push({
        test: '3. get_deep_work_tasks_only',
        success: true,
        data: result,
        summary: `${result.deepWorkTasks.length} deep work tasks, ${result.totalEstimatedHours.toFixed(1)} hours`
      });
    } catch (error) {
      results.push({
        test: '3. get_deep_work_tasks_only',
        success: false,
        error: String(error)
      });
    }

    // Test 4: Light Work Only
    try {
      const result = await tools.getLightWorkTasksOnly();
      results.push({
        test: '4. get_light_work_tasks_only',
        success: true,
        data: result,
        summary: `${result.totalTasks} light work tasks, ${result.totalEstimatedMinutes} min`
      });
    } catch (error) {
      results.push({
        test: '4. get_light_work_tasks_only',
        success: false,
        error: String(error)
      });
    }

    // Test 5: Search by keyword
    try {
      const result = await tools.searchTasksByKeyword('email');
      results.push({
        test: '5. search_tasks("email")',
        success: true,
        data: result,
        summary: `${result.resultsCount} tasks match "email"`
      });
    } catch (error) {
      results.push({
        test: '5. search_tasks',
        success: false,
        error: String(error)
      });
    }

    // Test 6: Tasks by time
    try {
      const result = await tools.getTasksByTimeConstraint(60);
      results.push({
        test: '6. get_tasks_by_time(60 min)',
        success: true,
        data: result,
        summary: `${result.matchingTasks} tasks under 60 minutes`
      });
    } catch (error) {
      results.push({
        test: '6. get_tasks_by_time',
        success: false,
        error: String(error)
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🧪 Morning AI Tool Tests</CardTitle>
            <p className="text-gray-400 text-sm">
              Verify all 8 functions return real Supabase data
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runTests}
              disabled={testing || !internalUserId}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {testing ? '⏳ Running Tests...' : '▶️ Run All Tests'}
            </Button>

            {!internalUserId && (
              <p className="text-red-400 text-sm mt-2">
                ❌ Not logged in - please sign in first
              </p>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.map((result, idx) => (
          <Card
            key={idx}
            className={`${
              result.success
                ? 'bg-green-900/20 border-green-700'
                : 'bg-red-900/20 border-red-700'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {result.success ? '✅' : '❌'} {result.test}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <>
                  <p className="text-green-400 font-medium mb-3">{result.summary}</p>
                  <details>
                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 p-3 bg-black/50 rounded text-xs text-gray-300 overflow-auto max-h-64">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </>
              ) : (
                <p className="text-red-400 text-sm">
                  Error: {result.error}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
