/**
 * LifeVisionSection - Vision Page
 *
 * Displays life mission, core values, 5-year vision, and life philosophy
 */

import React from 'react';
import { Star, Heart, Target, Compass, Quote } from 'lucide-react';
import type { LifeVisionData } from '../_shared/types';

interface LifeVisionSectionProps {
  visionData: LifeVisionData;
}

export const LifeVisionSection: React.FC<LifeVisionSectionProps> = ({ visionData }) => {
  const { missionStatement, coreValues, fiveYearVision, lifePhilosophy } = visionData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Star className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Life Vision</h1>
        <p className="text-gray-400">Your purpose, values, and future direction</p>
      </div>

      {/* Mission Statement */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <div className="flex items-center mb-4">
            <Compass className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">Mission Statement</h2>
          </div>
          <p className="text-xl text-white leading-relaxed italic">
            &ldquo;{missionStatement}&rdquo;
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-6">
            <Heart className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{value.value}</h3>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                    {value.importance}/10
                  </span>
                </div>
                <p className="text-sm text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Year Vision */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-6">
            <Target className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">5-Year Vision</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VisionCard
              title="Career"
              description={fiveYearVision.career}
              icon=""
              color="blue"
            />
            <VisionCard
              title="Health"
              description={fiveYearVision.health}
              icon=""
              color="green"
            />
            <VisionCard
              title="Financial"
              description={fiveYearVision.financial}
              icon=""
              color="yellow"
            />
            <VisionCard
              title="Relationships"
              description={fiveYearVision.relationships}
              icon=""
              color="pink"
            />
            <VisionCard
              title="Personal Growth"
              description={fiveYearVision.personal}
              icon=""
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Life Philosophy */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <div className="flex items-center mb-4">
            <Quote className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">Life Philosophy</h2>
          </div>
          <p className="text-lg text-white leading-relaxed">
            {lifePhilosophy}
          </p>
        </div>
      </section>
    </div>
  );
};

// Helper component for vision cards
interface VisionCardProps {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'pink' | 'purple';
}

const VisionCard: React.FC<VisionCardProps> = ({ title, description, color }) => {
  const colorClasses = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    pink: 'border-pink-500/20 bg-pink-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  };

  const titleColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    pink: 'text-pink-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <h3 className={`font-semibold ${titleColors[color]} mb-2`}>{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
};
