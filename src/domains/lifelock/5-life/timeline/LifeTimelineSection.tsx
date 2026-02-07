/**
 * LifeTimelineSection - Multi-Year Timeline Page
 *
 * Displays year cards with highlights and major life events
 */

import React from 'react';
import { Calendar, MapPin, Briefcase, Heart, DollarSign, Star } from 'lucide-react';
import type { YearTimelineData, LifeEvent } from '../_shared/types';

interface LifeTimelineSectionProps {
  timelineData: YearTimelineData[];
}

const eventTypeIcons = {
  career: Briefcase,
  personal: Heart,
  health: Star,
  financial: DollarSign,
};

const eventTypeColors = {
  career: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  personal: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  health: 'bg-green-500/20 text-green-400 border-green-500/30',
  financial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export const LifeTimelineSection: React.FC<LifeTimelineSectionProps> = ({ timelineData }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Calendar className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Life Timeline</h1>
        <p className="text-gray-400">Your journey through the years</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 via-amber-500/30 to-transparent transform md:-translate-x-1/2" />

        {/* Year Cards */}
        <div className="space-y-8">
          {timelineData.map((yearData, index) => (
            <YearCard
              key={yearData.year}
              yearData={yearData}
              isLeft={index % 2 === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface YearCardProps {
  yearData: YearTimelineData;
  isLeft: boolean;
  index: number;
}

const YearCard: React.FC<YearCardProps> = ({ yearData, isLeft, index }) => {
  const { year, highlights, majorEvents, chapter } = yearData;
  const isCurrentYear = year === new Date().getFullYear();

  return (
    <div className="relative flex items-start md:items-center">
      {/* Timeline Dot */}
      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
        <div className={`w-4 h-4 rounded-full border-2 ${isCurrentYear ? 'bg-amber-500 border-amber-400' : 'bg-gray-900 border-amber-500/50'}`}>
          {isCurrentYear && <div className="w-full h-full rounded-full bg-amber-500 animate-pulse" />}
        </div>
      </div>

      {/* Content */}
      <div className={`ml-16 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
        <div className={`relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border ${isCurrentYear ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-amber-500/20'}`}>
          {/* Year Header */}
          <div className={`flex items-center gap-3 mb-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
            <div className={`text-2xl font-bold ${isCurrentYear ? 'text-amber-400' : 'text-white'}`}>
              {year}
            </div>
            {isCurrentYear && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                Current
              </span>
            )}
          </div>

          {/* Life Chapter */}
          {chapter && (
            <div className={`mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 ${isLeft ? 'md:text-right' : ''}`}>
              <div className="text-sm font-medium text-amber-400 mb-1">
                {chapter.title}
              </div>
              <div className="text-xs text-gray-400">
                {chapter.description}
              </div>
            </div>
          )}

          {/* Highlights */}
          <div className={`space-y-2 mb-4 ${isLeft ? 'md:text-right' : ''}`}>
            {highlights.map((highlight, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-sm text-gray-300 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          {/* Major Events */}
          {majorEvents.length > 0 && (
            <div className={`space-y-2 ${isLeft ? 'md:text-right' : ''}`}>
              <div className={`text-xs text-gray-500 mb-2 ${isLeft ? 'md:text-right' : ''}`}>Major Events</div>
              {majorEvents.map((event, idx) => (
                <EventItem key={idx} event={event} isLeft={isLeft} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EventItemProps {
  event: LifeEvent;
  isLeft: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, isLeft }) => {
  const Icon = eventTypeIcons[event.type];
  const colorClass = eventTypeColors[event.type];

  return (
    <div className={`flex items-center gap-2 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span>{event.title}</span>
      </div>
      <span className="text-xs text-gray-500">
        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
};
