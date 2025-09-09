import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatCompactNumber } from '@/shared/lib/formatters';
import { 
  Loader2, 
  Users, 
  ClipboardList, 
  Inbox, 
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const monthlyData = [
  { name: 'Jan', leads: 35, clients: 12 },
  { name: 'Feb', leads: 28, clients: 10 },
  { name: 'Mar', leads: 42, clients: 15 },
  { name: 'Apr', leads: 50, clients: 20 },
  { name: 'May', leads: 45, clients: 18 },
  { name: 'Jun', leads: 55, clients: 25 },
];

const weeklyData = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 18 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 20 },
  { name: 'Fri', tasks: 25 },
  { name: 'Sat', tasks: 10 },
  { name: 'Sun', tasks: 5 },
];

export const AdminStats = React.memo(function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [leads, clients, plans, onboarding] = await Promise.all([
        supabase.from('instagram_leads').select('count').single(),
        supabase.from('client_onboarding').select('count').single(),
        supabase.from('plans').select('count').single(),
        supabase.from('onboarding').select('count').single(),
      ]);
      
      return {
        totalLeads: leads.count || 0,
        totalClients: clients.count || 0,
        totalPlans: plans.count || 0,
        totalOnboarding: onboarding.count || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="border border-orange-500/20 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-orange-500/20 bg-black">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Monthly Growth</h3>
            <div className="flex items-center text-orange-400 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              15.3%
            </div>
          </div>
          
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#e5e7eb' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  name="Leads"
                  stroke="#f97316" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="clients" 
                  name="Clients"
                  stroke="#ea580c" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Weekly Tasks</h3>
            <div className="flex items-center text-orange-600 text-xs font-medium">
              <TrendingDown className="h-3.5 w-3.5 mr-1" />
              5.2%
            </div>
          </div>
          
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#e5e7eb' 
                  }} 
                />
                <Bar 
                  dataKey="tasks" 
                  fill="url(#taskGradient)" 
                  radius={[4, 4, 0, 0]} 
                  name="Tasks"
                >
                  <defs>
                    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-black/50 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Inbox className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-white">Total Leads</p>
                <p className="text-xl font-bold text-white">{formatCompactNumber(stats?.totalLeads || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-white">Total Clients</p>
                <p className="text-xl font-bold text-white">{formatCompactNumber(stats?.totalClients || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
