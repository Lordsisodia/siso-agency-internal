import React from 'react';
import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Globe, 
  DollarSign, 
  Calendar, 
  User, 
  Briefcase,
  Target,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClientProjectOverviewProps {
  client: ClientData;
}

export function ClientProjectOverview({ client }: ClientProjectOverviewProps) {
  const getProgressColor = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'completed': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'in progress': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'mvp building': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'mvp built': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'production': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      case 'in development': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40 shadow-gray-500/20';
    }
  };

  const getStatusIcon = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in progress': return <PlayCircle className="w-4 h-4" />;
      case 'mvp building': return <AlertCircle className="w-4 h-4" />;
      case 'mvp built': return <CheckCircle className="w-4 h-4" />;
      case 'production': return <CheckCircle className="w-4 h-4" />;
      case 'in development': return <PlayCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Business Information */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <Building className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Business Information
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Business Name</p>
            <p className="font-semibold text-white text-lg">{client.business_name || 'Not specified'}</p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Contact Person</p>
            <p className="font-semibold text-white">{client.full_name || 'Not specified'}</p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Industry</p>
            <p className="font-semibold text-white">{client.company_niche || 'Not specified'}</p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Professional Role</p>
            <p className="font-semibold text-white">{client.professional_role || client.bio || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <Briefcase className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Project Details
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Project Name</p>
            <p className="font-semibold text-white text-lg">{client.project_name || 'Not specified'}</p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-2">Progress Status</p>
            <Badge className={`border shadow-sm ${getProgressColor(client.progress || 'Not Started')}`}>
              <span className="flex items-center gap-1.5 font-medium">
                {getStatusIcon(client.progress || 'Not Started')}
                {client.progress || 'Not Started'}
              </span>
            </Badge>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-2">Current Phase</p>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">
                Step {client.current_step || 0} of {client.total_steps || 10}
              </span>
              <span className="text-sm text-orange-300 font-medium">
                {Math.round(((client.current_step || 0) / (client.total_steps || 10)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-orange-900/40 rounded-full h-3 border border-orange-800/50">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30" 
                style={{ width: `${((client.current_step || 0) / (client.total_steps || 10)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">MVP Build Status</p>
            <p className="font-semibold text-white">{client.mvp_build_status || 'Not started'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <DollarSign className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Financial Information
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Project Value</p>
            <p className="font-semibold text-3xl text-orange-400 font-mono">
              {client.estimated_price 
                ? `£${client.estimated_price.toLocaleString()}` 
                : '£0'
              }
            </p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-2">Payment Status</p>
            <Badge 
              variant={client.payment_status === 'Confirmed' ? 'default' : 'outline'}
              className="bg-orange-500/20 text-orange-300 border-orange-500/40"
            >
              {client.payment_status || 'Not Invoiced'}
            </Badge>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-2">Priority Level</p>
            <Badge 
              variant={client.priority === 'high' ? 'destructive' : 'secondary'}
              className={client.priority === 'high' 
                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              }
            >
              <Zap className="w-3 h-3 mr-1" />
              {client.priority || 'Medium'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Timeline
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Created</p>
            <p className="font-semibold text-white">
              {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Last Updated</p>
            <p className="font-semibold text-white">
              {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
            </p>
          </div>
          {client.initial_contact_date && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
              <p className="text-sm text-orange-200/80 font-medium mb-1">Initial Contact</p>
              <p className="font-semibold text-white">
                {formatDistanceToNow(new Date(client.initial_contact_date), { addSuffix: true })}
              </p>
            </div>
          )}
          {client.start_date && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
              <p className="text-sm text-orange-200/80 font-medium mb-1">Project Started</p>
              <p className="font-semibold text-white">
                {formatDistanceToNow(new Date(client.start_date), { addSuffix: true })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links & Resources */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <Globe className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Links & Resources
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.website_url && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30 hover:bg-orange-800/30 transition-colors">
              <p className="text-sm text-orange-200/80 font-medium mb-2">Live Website</p>
              <a 
                href={client.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </a>
            </div>
          )}
          {client.development_url && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30 hover:bg-orange-800/30 transition-colors">
              <p className="text-sm text-orange-200/80 font-medium mb-2">Development URL</p>
              <a 
                href={client.development_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Dev Site
              </a>
            </div>
          )}
          {client.notion_plan_url && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30 hover:bg-orange-800/30 transition-colors">
              <p className="text-sm text-orange-200/80 font-medium mb-2">Project Plan</p>
              <a 
                href={client.notion_plan_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                Notion Plan
              </a>
            </div>
          )}
          {!client.website_url && !client.development_url && !client.notion_plan_url && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30 text-center">
              <p className="text-orange-200/60 text-sm">No links available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks & Next Steps */}
      <Card className="bg-gradient-to-br from-gray-900/60 to-black/40 border-orange-500/30 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-400/30">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Tasks & Next Steps
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-1">Open Tasks</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white text-xl">
                {client.todos?.length || 0}
              </p>
              <span className="text-orange-300 text-sm font-medium">pending tasks</span>
            </div>
          </div>
          {client.next_steps && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
              <p className="text-sm text-orange-200/80 font-medium mb-1">Next Steps</p>
              <p className="font-semibold text-white">{client.next_steps}</p>
            </div>
          )}
          {client.key_research && (
            <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
              <p className="text-sm text-orange-200/80 font-medium mb-1">Key Research</p>
              <p className="font-semibold text-white">{client.key_research}</p>
            </div>
          )}
          <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-700/30">
            <p className="text-sm text-orange-200/80 font-medium mb-2">Completed Steps</p>
            <div className="flex flex-wrap gap-2">
              {client.completed_steps?.map((step, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-orange-500/10 text-orange-300 border-orange-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {step}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
