/**
 * Life Vision Section
 * 
 * Life mission, core values, 5-year vision, philosophy
 */

import React, { useState } from 'react';
import { Compass, Heart, Target, Lightbulb, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { LifeVisionData } from '../_shared/types';

interface LifeVisionSectionProps {
  visionData: LifeVisionData;
}

export const LifeVisionSection: React.FC<LifeVisionSectionProps> = ({ visionData }) => {
  const [mission, setMission] = useState(visionData.missionStatement);
  const [philosophy, setPhilosophy] = useState(visionData.lifePhilosophy);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <CardHeader className="p-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400 flex items-center text-2xl">
                  <Compass className="h-6 w-6 mr-2" />
                  🌟 Life Vision
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Your North Star - mission, values, and vision
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-orange-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                🎯 Life Mission Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isEditing ? (
                <Textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="bg-gray-800/50 border-orange-500/30 text-white min-h-[100px]"
                />
              ) : (
                <div className="text-lg text-gray-200 italic leading-relaxed">
                  "{mission}"
                </div>
              )}
            </CardContent>
          </div>
        </section>

        {/* Core Values */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                💎 Core Values
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {visionData.coreValues.map((cv, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-blue-300">{cv.value}</div>
                      <div className="flex">
                        {Array.from({ length: cv.importance }).map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">{cv.description}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* 5-Year Vision */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                🔮 5-Year Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {Object.entries(visionData.fiveYearVision).map(([key, vision], idx) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4"
                  >
                    <div className="text-sm font-bold text-purple-300 mb-2 capitalize">{key}</div>
                    <div className="text-gray-200">{vision}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Life Philosophy */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                💡 Life Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isEditing ? (
                <Textarea
                  value={philosophy}
                  onChange={(e) => setPhilosophy(e.target.value)}
                  className="bg-gray-800/50 border-green-500/30 text-white min-h-[100px]"
                />
              ) : (
                <div className="text-lg text-gray-200 italic leading-relaxed">
                  {philosophy}
                </div>
              )}
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};
