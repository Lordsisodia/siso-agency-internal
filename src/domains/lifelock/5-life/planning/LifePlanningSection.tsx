/**
 * LifePlanningSection - Planning & Roadmap Page
 *
 * Displays 1/3/5/10-year life planning and roadmap
 */

import React from 'react';
import { Rocket, Target, Map, Crown, Calendar, CheckCircle2, Circle } from 'lucide-react';
import type { LifePlanning } from '../_shared/types';

interface LifePlanningSectionProps {
  planningData: LifePlanning;
}

export const LifePlanningSection: React.FC<LifePlanningSectionProps> = ({ planningData }) => {
  const { oneYear, threeYear, fiveYear, tenYear } = planningData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Rocket className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Planning & Roadmap</h1>
        <p className="text-gray-400">Your 1/3/5/10-year life plan</p>
      </div>

      {/* 1-Year Plan */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-400">1-Year Plan</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full ml-auto">Current</span>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-4 mb-4 border border-blue-500/20">
            <div className="text-sm text-gray-400 mb-1">Primary Focus</div>
            <div className="text-lg font-medium text-white">{oneYear.focus}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Priorities</div>
            <div className="space-y-2">
              {oneYear.priorities.map((priority, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 flex-shrink-0">
                    {idx + 1}
                  </span>
                  {priority}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">Milestones</div>
            <div className="space-y-2">
              {oneYear.milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : milestone.status === 'in-progress' ? (
                      <Circle className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-600" />
                    )}
                    <span className={`text-sm ${milestone.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                      {milestone.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(milestone.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Year Vision */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-purple-400">3-Year Vision</h2>
          </div>

          <div className="bg-purple-500/10 rounded-xl p-4 mb-4 border border-purple-500/20">
            <div className="text-sm text-gray-400 mb-1">Vision Statement</div>
            <div className="text-white leading-relaxed">{threeYear.vision}</div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">Key Achievements</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {threeYear.keyAchievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5-Year Roadmap */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-400">5-Year Roadmap</h2>
          </div>

          <div className="space-y-4">
            {fiveYear.roadmap.map((year, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                      <span className="text-sm font-bold text-amber-400">{year.year}</span>
                    </div>
                    {idx < fiveYear.roadmap.length - 1 && (
                      <div className="w-0.5 h-full bg-amber-500/20 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Goals</div>
                          <div className="space-y-1">
                            {year.goals.map((goal, gidx) => (
                              <div key={gidx} className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {goal}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Metrics</div>
                          <div className="space-y-1">
                            {year.metrics.map((metric, midx) => (
                              <div key={midx} className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {metric}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10-Year Plan */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-yellow-400">10-Year Ultimate Vision</h2>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-6 mb-4 border border-yellow-500/20">
            <div className="text-sm text-gray-400 mb-2">Ultimate Vision</div>
            <div className="text-xl font-medium text-white leading-relaxed">{tenYear.ultimateVision}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Legacy Goals</div>
            <div className="space-y-2">
              {tenYear.legacyGoals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs text-yellow-400 flex-shrink-0">
                    {idx + 1}
                  </span>
                  {goal}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Life State</div>
            <div className="text-gray-300 leading-relaxed">{tenYear.lifeState}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
