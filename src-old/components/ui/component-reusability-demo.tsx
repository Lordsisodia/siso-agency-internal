/**
 * 🎭 Component Reusability Demo
 * 
 * Demonstrates how the same TaskContainer architecture works for both
 * Deep Work and Light Work with different themes and data.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SisoDeepFocusPlanV2 from "./siso-deep-focus-plan-v2";
import SisoLightWorkPlan from "./siso-light-work-plan";
import { Button } from "@/components/ui/button";
import { Brain, Zap } from "lucide-react";

type ViewMode = 'deep' | 'light' | 'side-by-side';

export default function ComponentReusabilityDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            🎭 Component Reusability Demo
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Same TaskContainer architecture • Different themes • Full CRUD operations
          </p>
          
          {/* View Mode Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setViewMode('deep')}
              variant={viewMode === 'deep' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Deep Work Only
            </Button>
            <Button
              onClick={() => setViewMode('light')}
              variant={viewMode === 'light' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Light Work Only
            </Button>
            <Button
              onClick={() => setViewMode('side-by-side')}
              variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
            >
              Side by Side
            </Button>
          </div>
        </motion.div>

        {/* Component Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'deep' && (
            <motion.div
              key="deep"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-800/50 rounded-xl border border-orange-500/30 p-6">
                <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-3">
                  <Brain className="w-6 h-6" />
                  Deep Work Mode
                </h2>
                <SisoDeepFocusPlanV2 
                  onStartFocusSession={(taskId, intensity) => {
                    console.log('Deep Work Focus Session:', { taskId, intensity });
                  }}
                />
              </div>
            </motion.div>
          )}

          {viewMode === 'light' && (
            <motion.div
              key="light"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-800/50 rounded-xl border border-emerald-500/30 p-6">
                <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Light Work Mode
                </h2>
                <SisoLightWorkPlan 
                  onStartFocusSession={(taskId, intensity) => {
                    console.log('Light Work Focus Session:', { taskId, intensity });
                  }}
                />
              </div>
            </motion.div>
          )}

          {viewMode === 'side-by-side' && (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              {/* Deep Work Column */}
              <div className="bg-gray-800/50 rounded-xl border border-orange-500/30 p-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-3">
                  <Brain className="w-5 h-5" />
                  Deep Work (Reusable Architecture)
                </h2>
                <div className="text-sm text-gray-400 mb-4">
                  • TaskContainer with theme="deep-work"<br/>
                  • Focus intensity 3-4 (Deep Flow, Ultra-Deep)<br/>
                  • Longer tasks (45-120min estimates)<br/>
                  • Orange/red color scheme
                </div>
                <SisoDeepFocusPlanV2 
                  onStartFocusSession={(taskId, intensity) => {
                    console.log('Deep Work Focus Session:', { taskId, intensity });
                  }}
                />
              </div>

              {/* Light Work Column */}
              <div className="bg-gray-800/50 rounded-xl border border-emerald-500/30 p-6">
                <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  Light Work (Same Architecture)
                </h2>
                <div className="text-sm text-gray-400 mb-4">
                  • TaskContainer with theme="light-work"<br/>
                  • Focus intensity 1-2 (Light, Medium Focus)<br/>
                  • Shorter tasks (10-30min estimates)<br/>
                  • Emerald/teal color scheme
                </div>
                <SisoLightWorkPlan 
                  onStartFocusSession={(taskId, intensity) => {
                    console.log('Light Work Focus Session:', { taskId, intensity });
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Architecture Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gray-800/30 rounded-xl border border-gray-600/30 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">🏗️ Reusable Architecture Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">📦 Same Components</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• TaskCard.tsx (presentational)</li>
                <li>• TaskDetailModal.tsx (CRUD)</li>
                <li>• TaskContainer.tsx (state)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">🎨 Different Themes</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Deep Work: Orange/red theme</li>
                <li>• Light Work: Emerald/teal theme</li>
                <li>• Easy to add more themes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">⚡ Full Functionality</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Add/edit/delete tasks & subtasks</li>
                <li>• Status cycling & focus sessions</li>
                <li>• Real-time state updates</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Export for testing
export { ComponentReusabilityDemo };