/**
 * LifeBalanceSection - Balance Scorecard Page
 *
 * Displays life balance wheel, category scores, and insights
 */

import React from 'react';
import { PieChart, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { LifeBalanceScores } from '../_shared/types';

interface LifeBalanceSectionProps {
  balanceData: LifeBalanceScores;
}

const categories = [
  { key: 'health', label: 'Health', color: '#22c55e', icon: '💪' },
  { key: 'career', label: 'Career', color: '#3b82f6', icon: '💼' },
  { key: 'financial', label: 'Financial', color: '#eab308', icon: '💰' },
  { key: 'relationships', label: 'Relationships', color: '#ec4899', icon: '❤️' },
  { key: 'personal', label: 'Personal', color: '#a855f7', icon: '🌱' },
] as const;

export const LifeBalanceSection: React.FC<LifeBalanceSectionProps> = ({ balanceData }) => {
  const { health, career, financial, relationships, personal, overall } = balanceData;

  const scores = { health, career, financial, relationships, personal };

  // Find lowest and highest scores for insights
  const entries = Object.entries(scores);
  const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
  const highest = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <PieChart className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Life Balance</h1>
        <p className="text-gray-400">Comprehensive life assessment</p>
      </div>

      {/* Overall Score */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
          <div className="text-sm text-gray-400 mb-2">Overall Life Score</div>
          <div className="text-5xl font-bold text-amber-400 mb-2">{overall}</div>
          <div className="text-sm text-gray-400">
            {overall >= 80 ? 'Thriving' : overall >= 60 ? 'Balanced' : overall >= 40 ? 'Developing' : 'Needs Attention'}
          </div>
        </div>
      </section>

      {/* Balance Wheel & Scores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Wheel */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center mb-4">
              <PieChart className="h-5 w-5 text-amber-400 mr-2" />
              <h2 className="text-lg font-semibold text-amber-400">Balance Wheel</h2>
            </div>
            <BalanceWheel scores={scores} size={280} />
          </div>
        </section>

        {/* Category Scores */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-amber-400 mr-2" />
              <h2 className="text-lg font-semibold text-amber-400">Category Scores</h2>
            </div>
            <div className="space-y-4">
              {categories.map((category) => {
                const score = scores[category.key as keyof typeof scores];
                return (
                  <div key={category.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-sm text-gray-300">{category.label}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: category.color }}>
                        {score}/100
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Insights */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">Balance Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strength */}
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Your Strength</span>
              </div>
              <p className="text-sm text-gray-300">
                Your <span className="text-white font-medium capitalize">{highest[0]}</span> is your strongest area at{' '}
                <span className="text-green-400 font-medium">{highest[1]}/100</span>. Keep nurturing this area while building up others.
              </p>
            </div>

            {/* Focus Area */}
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Focus Area</span>
              </div>
              <p className="text-sm text-gray-300">
                Your <span className="text-white font-medium capitalize">{lowest[0]}</span> could use more attention at{' '}
                <span className="text-amber-400 font-medium">{lowest[1]}/100</span>. Consider setting specific goals here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Balance Wheel Component
interface BalanceWheelProps {
  scores: { health: number; career: number; financial: number; relationships: number; personal: number };
  size?: number;
}

const BalanceWheel: React.FC<BalanceWheelProps> = ({ scores, size = 280 }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size / 2) - 40;

  const categoryScores = [
    { label: 'Health', score: scores.health, color: '#22c55e' },
    { label: 'Career', score: scores.career, color: '#3b82f6' },
    { label: 'Financial', score: scores.financial, color: '#eab308' },
    { label: 'Relationships', score: scores.relationships, color: '#ec4899' },
    { label: 'Personal', score: scores.personal, color: '#a855f7' },
  ];

  const angleStep = (2 * Math.PI) / categoryScores.length;

  // Generate polygon points for the score area
  const scorePoints = categoryScores.map((cat, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (cat.score / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const polygonPoints = scorePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circles */}
        {[20, 40, 60, 80, 100].map((percent) => (
          <circle
            key={percent}
            cx={centerX}
            cy={centerY}
            r={(percent / 100) * maxRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Grid lines */}
        {categoryScores.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = centerX + maxRadius * Math.cos(angle);
          const y2 = centerY + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(245, 158, 11, 0.2)"
          stroke="#f59e0b"
          strokeWidth="2"
        />

        {/* Score points */}
        {scorePoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={categoryScores[i].color}
            stroke="#1f2937"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {categoryScores.map((cat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 25;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={cat.color}
              fontSize="11"
              fontWeight="500"
            >
              {cat.label}
            </text>
          );
        })}

        {/* Center score */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#f59e0b"
          fontSize="24"
          fontWeight="bold"
        >
          {Math.round((scores.health + scores.career + scores.financial + scores.relationships + scores.personal) / 5)}
        </text>
      </svg>
    </div>
  );
};
