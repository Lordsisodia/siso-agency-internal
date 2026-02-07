/**
 * LifeReviewSection - Life Review Page
 *
 * Displays quarterly reviews, course corrections, and priority assessments
 */

import React from 'react';
import { Lightbulb, ArrowRight, Target, Calendar, TrendingUp } from 'lucide-react';
import type { LifeReview } from '../_shared/types';

interface LifeReviewSectionProps {
  reviews: LifeReview[];
}

export const LifeReviewSection: React.FC<LifeReviewSectionProps> = ({ reviews }) => {
  const latestReview = reviews[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Lightbulb className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Life Review</h1>
        <p className="text-gray-400">Quarterly reflection and course correction</p>
      </div>

      {/* Latest Review Summary */}
      {latestReview && (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-amber-400">
                  {latestReview.type === 'quarterly' ? 'Quarterly' : 'Annual'} Review
                </h2>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(latestReview.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Satisfaction Score */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400">{latestReview.satisfactionScore}</div>
                <div className="text-xs text-gray-400">Satisfaction Score</div>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${latestReview.satisfactionScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Needs Work</span>
                  <span>Thriving</span>
                </div>
              </div>
            </div>

            {/* Reflections */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Reflections</span>
              </div>
              <p className="text-sm text-gray-300">{latestReview.reflections}</p>
            </div>
          </div>
        </section>
      )}

      {/* Course Corrections */}
      {latestReview && latestReview.courseCorrections.length > 0 && (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Course Corrections</h2>
            </div>
            <div className="space-y-3">
              {latestReview.courseCorrections.map((correction, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-400 font-medium">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{correction}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Priorities */}
      {latestReview && latestReview.priorities.length > 0 && (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-green-400">Current Priorities</h2>
            </div>
            <div className="space-y-3">
              {latestReview.priorities.map((priority, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-400 font-medium">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{priority}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Review History */}
      {reviews.length > 1 && (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-amber-400">Review History</h2>
            </div>
            <div className="space-y-3">
              {reviews.slice(1).map((review, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      {review.type === 'quarterly' ? 'Quarterly' : 'Annual'} Review
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">{review.satisfactionScore}</div>
                    <div className="text-xs text-gray-500">Satisfaction</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
