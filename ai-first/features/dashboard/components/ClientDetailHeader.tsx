import React from 'react';
import { ClientData } from '@/types/client.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClientDetailHeaderProps {
  client: ClientData;
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40';
      case 'in progress': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40';
      case 'not contacted': return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40';
      case 'contacted': return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40';
      case 'waiting on client': return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/40';
      case 'feedback from app': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'completed': return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40';
      case 'in progress': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40';
      case 'mvp building': return 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/40';
      case 'mvp built': return 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/40';
      case 'production': return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40';
      case 'in development': return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40';
      case 'not started': return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in progress': return <TrendingUp className="w-4 h-4" />;
      case 'not contacted': return <Clock className="w-4 h-4" />;
      case 'contacted': return <CheckCircle className="w-4 h-4" />;
      case 'waiting on client': return <AlertCircle className="w-4 h-4" />;
      case 'feedback from app': return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Client Avatar & Main Info */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">
                {client.full_name?.charAt(0) || client.business_name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {client.full_name || 'Unknown Client'}
                </h1>
                <h2 className="text-xl text-blue-300 font-semibold mb-3">
                  {client.business_name || 'No Business Name'}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`shadow-sm ${getStatusColor(client.status || 'Unknown')}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      {getStatusIcon(client.status || 'Unknown')}
                      {client.status || 'Unknown'}
                    </span>
                  </Badge>
                  <Badge className={`shadow-sm ${getProgressColor(client.progress || 'Not Started')}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {client.progress || 'Not Started'}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {client.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg backdrop-blur-sm border border-gray-700/40">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg backdrop-blur-sm border border-gray-700/40">
                  <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium">{client.phone}</span>
                </div>
              )}
              {client.website_url && (
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg backdrop-blur-sm border border-gray-700/40">
                  <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <a 
                    href={client.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-300 hover:text-cyan-200 font-medium truncate transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg backdrop-blur-sm border border-gray-700/40">
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 font-medium">
                  Client since {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Summary & Actions */}
        <div className="lg:w-80 space-y-6">
          {/* Project Summary Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-700/50 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-blue-500/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Project Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200/80">Project Name</span>
                <span className="text-sm font-medium text-white">{client.project_name || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200/80">Industry</span>
                <span className="text-sm font-medium text-white">{client.company_niche || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200/80">Last Updated</span>
                <span className="text-sm font-medium text-white">
                  {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-200/80">Onboarding</span>
                <span className="text-sm font-medium text-white">
                  {client.current_step || 0}/{client.total_steps || 10} Steps Completed
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/30" 
                  style={{ width: `${((client.current_step || 0) / (client.total_steps || 10)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40">
              <Mail className="w-4 h-4 mr-2" />
              Contact Client
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300">
              <Globe className="w-4 h-4 mr-2" />
              View Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
