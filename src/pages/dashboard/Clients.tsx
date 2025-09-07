import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Target,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Network,
  UserPlus,
  Linkedin,
  Instagram,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { PartnershipLayout } from '@/ecosystem/partnership/components/PartnershipLayout';
import { PartnershipReferralsTable } from '@/ecosystem/partnership/components/PartnershipReferralsTable';
import { AirtablePartnersTable } from '@/ecosystem/partnership/components/AirtablePartnersTable';
import { DashboardGreetingCard } from '@/shared/ui/dashboard-templates';

export default function Clients() {
  const navigate = useNavigate();
  
  // Commission and referral data
  const quickStats = {
    totalCommission: 2450,
    activeReferrals: 3,
    conversionRate: 68,
    pipelineValue: 75650
  };

  const partnershipChannels = [
    { 
      name: 'Internal Network', 
      icon: Network,
      clients: 12, 
      conversions: 8, 
      revenue: 12000,
      conversionRate: 67,
      trainingPath: '/partner/training/internal-network'
    },
    { 
      name: 'LinkedIn Outreach', 
      icon: Linkedin,
      clients: 18, 
      conversions: 5, 
      revenue: 8000,
      conversionRate: 28,
      trainingPath: '/partner/training/linkedin-outreach'
    },
    { 
      name: 'Social Media', 
      icon: Instagram,
      clients: 8, 
      conversions: 2, 
      revenue: 3000,
      conversionRate: 25,
      trainingPath: '/partner/training/social-media'
    },
    { 
      name: 'Direct Referrals', 
      icon: UserPlus,
      clients: 5, 
      conversions: 4, 
      revenue: 15000,
      conversionRate: 80,
      trainingPath: '/partner/training/direct-referrals'
    }
  ];

  const handleTrainingClick = (trainingPath: string) => {
    // Navigate to training page
    navigate(trainingPath);
  };

  return (
    <PartnershipLayout>
      <div className="space-y-8">
        {/* Smart Dashboard Greeting Card - New Header */}
        <DashboardGreetingCard 
          pageTitle="Client Management Hub"
          pageSubtitle="Your partnership revenue engine - track referrals & commissions"
          showDate={true}
          pageContext={{
            pageType: 'clients',
            keyMetrics: {
              primary: { value: '12', label: 'Active Clients', trend: '+2' },
              secondary: { value: '89%', label: 'Satisfaction Rate' }
            },
            urgentItems: 3
          }}
        />

        {/* Quick Stats Bar - Most Important Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{quickStats.totalCommission.toLocaleString()}</div>
              <div className="flex items-center text-sm text-green-400">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Referrals</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{quickStats.activeReferrals}</div>
              <div className="flex items-center text-sm text-orange-400">
                <Clock className="h-3 w-3 mr-1" />
                In progress
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{quickStats.conversionRate}%</div>
              <div className="flex items-center text-sm text-green-400">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5% vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{quickStats.pipelineValue.toLocaleString()}</div>
              <div className="flex items-center text-sm text-green-400">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +18% potential
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Partner Projects Table - Primary Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Users className="h-6 w-6 mr-2 text-orange-500" />
                Partner Projects Portfolio
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Track and manage your partner projects with Airtable-style interface
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <AirtablePartnersTable />
            </CardContent>
          </Card>
        </motion.div>

        {/* Partnership Channels - Simplified with Training Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white flex items-center">
                  <Network className="h-6 w-6 mr-2 text-orange-500" />
                  Partnership Channels
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Track performance by channel and access training resources
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/partner/training')}
                className="bg-orange-600 text-white hover:bg-orange-700 border-0"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                All Training
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnershipChannels.map((channel, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between p-4 bg-black border border-gray-700 rounded-lg hover:border-orange-500/30 hover:bg-gray-900/50 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                          <channel.icon className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {channel.name}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                            <span>{channel.clients} clients</span>
                            <span>{channel.conversions} conversions</span>
                            <span>{channel.conversionRate}% rate</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">£{channel.revenue.toLocaleString()}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTrainingClick(channel.trainingPath)}
                          className="text-xs text-gray-400 hover:text-orange-400 p-1 h-auto"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Training
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Training Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                Quick Training Access
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Essential SOPs and training materials for effective client acquisition
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/partner/training/prospecting')}
                  className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-orange-500/30 hover:text-orange-400"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Prospecting
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/partner/training/follow-up')}
                  className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-orange-500/30 hover:text-orange-400"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Follow-up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/partner/training/closing')}
                  className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-orange-500/30 hover:text-orange-400"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Closing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/partner/training')}
                  className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-orange-500/30 hover:text-orange-400"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PartnershipLayout>
  );
}