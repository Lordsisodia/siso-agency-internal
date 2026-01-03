import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Rocket,
  BarChart3,
  Zap,
  Target,
  Calendar,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const ClientManagement: React.FC = () => {
  const clientPipeline = [
    {
      name: 'TechCorp signed contract',
      status: 'completed',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      textColor: 'text-green-300',
      value: '£12K',
      badgeColor: 'green'
    },
    {
      name: 'StartupXYZ meeting scheduled',
      status: 'in-progress',
      icon: Clock,
      iconColor: 'text-orange-400',
      textColor: 'text-orange-300',
      value: '£8K',
      badgeColor: 'orange'
    },
    {
      name: 'FinanceApp needs follow-up',
      status: 'pending',
      icon: AlertCircle,
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300',
      value: '£15K',
      badgeColor: 'blue'
    }
  ];

  const clientCategories = [
    {
      name: 'Startups',
      icon: Rocket,
      color: 'green',
      clientCount: 4
    },
    {
      name: 'Enterprise',
      icon: BarChart3,
      color: 'purple',
      clientCount: 3
    },
    {
      name: 'SaaS',
      icon: Zap,
      color: 'orange',
      clientCount: 5
    },
    {
      name: 'E-commerce',
      icon: Target,
      color: 'cyan',
      clientCount: 2
    }
  ];

  const clientStats = [
    {
      value: '12',
      label: 'Active',
      color: 'blue'
    },
    {
      value: '8',
      label: 'Converted',
      color: 'green'
    },
    {
      value: '3',
      label: 'Pending',
      color: 'orange'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="row-5b"
    >
      <Card className="bg-black/60 backdrop-blur-xl border-blue-500/20 shadow-2xl hover:border-blue-500/40 transition-all overflow-hidden">
        <div className="relative">
          {/* Hero Image Header */}
          <div className="relative h-32 bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-indigo-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/40 backdrop-blur-sm">
                👥 Client Hub
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                  <Users className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Client Management</h3>
                  <p className="text-sm text-blue-200">Relationship Excellence</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Featured Client Relationship Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Top Performers</span>
                </div>
                <span className="text-xs text-gray-400">12 Active Clients</span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">🎯 Client Pipeline Status</h4>
                <div className="space-y-2">
                  {clientPipeline.map((client, index) => {
                    const Icon = client.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Icon className={`h-3 w-3 ${client.iconColor}`} />
                        <span className={client.textColor}>{client.name}</span>
                        <Badge className={`bg-${client.badgeColor}-500/20 text-${client.badgeColor}-400 text-xs ml-auto`}>
                          {client.value}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <Progress value={75} className="h-2 mt-3" />
              </div>
            </div>

            {/* Client Categories & Types */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Client Categories</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/partner/clients'}
                  className="text-blue-400 hover:bg-blue-500/10 h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {clientCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div 
                      key={index}
                      className={`p-3 bg-${category.color}-500/10 border border-${category.color}-500/20 rounded-lg hover:bg-${category.color}-500/20 transition-colors cursor-pointer group`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 text-${category.color}-400`} />
                        <span className={`text-sm font-medium text-white group-hover:text-${category.color}-100`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">{category.clientCount} clients</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client Management Stats */}
            <div className="grid grid-cols-3 gap-3">
              {clientStats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center p-3 bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg`}
                >
                  <div className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Next Meeting Preview */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Next Meeting</span>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-auto">📅 Today</Badge>
              </div>
              <div className="text-sm text-white font-medium">Client Discovery Call - FinTech Startup</div>
              <div className="text-xs text-gray-400">Today • 3:00 PM • Sarah Johnson</div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/partner/clients'}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Clients
              </Button>
              <Button 
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                onClick={() => window.location.href = '/partner/referrals'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default ClientManagement;