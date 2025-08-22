
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, FileText, ListTodo, Wallet, 
  GitBranch, LayoutDashboard, Palette, 
  FileSearch, FileCheck, Terminal 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectOverviewCardsProps {
  projectId: string;
}

export function ProjectOverviewCards({ projectId }: ProjectOverviewCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'Project milestones and deadlines tracking',
      icon: Calendar,
      color: 'amber',
      stats: {
        milestones: 6,
        completed: 2,
        nextMilestone: 'Design Phase'
      },
      accentClass: 'bg-amber-500/20 text-amber-400 border-amber-500/20'
    },
    {
      id: 'active-tasks',
      title: 'Active Tasks',
      description: 'Current tasks and their progress status',
      icon: ListTodo,
      color: 'blue',
      stats: {
        total: 12,
        inProgress: 5,
        pending: 7
      },
      accentClass: 'bg-blue-500/20 text-blue-400 border-blue-500/20'
    },
    {
      id: 'financial',
      title: 'Financial Overview',
      description: 'Budget tracking and financial metrics',
      icon: Wallet,
      color: 'green',
      stats: {
        budget: '$50,000',
        spent: '$15,000',
        remaining: '$35,000'
      },
      accentClass: 'bg-green-500/20 text-green-400 border-green-500/20'
    },
    {
      id: 'features',
      title: 'Features',
      description: 'Feature requests and implementation status',
      icon: GitBranch,
      color: 'purple',
      stats: {
        total: 24,
        implemented: 8,
        inProgress: 6
      },
      accentClass: 'bg-purple-500/20 text-purple-400 border-purple-500/20'
    },
    {
      id: 'research',
      title: 'Research',
      description: 'Market analysis and technical documentation',
      icon: FileSearch,
      color: 'indigo',
      stats: {
        documents: 12,
        categories: 4,
        lastUpdated: 'Apr 18, 2025'
      },
      accentClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'app-plan',
      title: 'App Plan',
      description: 'Development roadmap and specifications',
      icon: FileCheck,
      color: 'violet',
      stats: {
        phases: 5,
        currentPhase: 'Design',
        completion: '40%'
      },
      accentClass: 'bg-violet-500/20 text-violet-400 border-violet-500/20'
    },
    {
      id: 'apis',
      title: 'APIs',
      description: 'API integration and documentation',
      icon: Terminal,
      color: 'rose',
      stats: {
        total: 8,
        active: 6,
        health: '95%'
      },
      accentClass: 'bg-rose-500/20 text-rose-400 border-rose-500/20'
    },
    {
      id: 'wireframe',
      title: 'Wireframe',
      description: 'UI/UX design wireframes and mockups',
      icon: LayoutDashboard,
      color: 'sky',
      stats: {
        screens: 15,
        approved: 10,
        inReview: 5
      },
      accentClass: 'bg-sky-500/20 text-sky-400 border-sky-500/20'
    },
    {
      id: 'colors',
      title: 'Colors',
      description: 'Color scheme and design system',
      icon: Palette,
      color: 'pink',
      stats: {
        primary: 5,
        secondary: 8,
        accent: 3
      },
      accentClass: 'bg-pink-500/20 text-pink-400 border-pink-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card 
          key={card.id}
          className="bg-black/30 border border-white/10 p-6 backdrop-blur-sm hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-2 rounded-md ${card.accentClass}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <Badge 
                variant="outline" 
                className={card.accentClass}
              >
                {Object.values(card.stats)[0]} {Object.keys(card.stats)[0]}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-neutral-400 text-sm mb-4 flex-grow">
              {card.description}
            </p>

            <div className="flex flex-col space-y-3 mb-4">
              {Object.entries(card.stats).map(([key, value], index) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-neutral-400">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className={`text-${card.color}-400 hover:text-${card.color}-300 hover:bg-${card.color}-500/10 flex justify-between w-full`}
              onClick={() => navigate(`/projects/${projectId}/${card.id}`)}
            >
              <span>View Details</span>
              <FileText className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
