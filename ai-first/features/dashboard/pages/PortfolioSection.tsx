import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  Image,
  FileText,
  BarChart3,
  Eye,
  ExternalLink,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  industry: string;
  completionDate: string;
  description: string;
  results: {
    metric: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  images: string[];
  tags: string[];
  status: 'completed' | 'in-progress' | 'planned';
}

// Mock data for demonstration
const mockProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'E-Commerce Platform Redesign',
    client: 'TechStart Solutions',
    industry: 'Technology',
    completionDate: '2024-01-15',
    description: 'Complete overhaul of e-commerce platform with modern UI/UX and enhanced functionality.',
    results: [
      { metric: 'Conversion Rate', before: '2.3%', after: '4.8%', improvement: '+108%' },
      { metric: 'User Engagement', before: '45 sec', after: '2:30 min', improvement: '+233%' },
      { metric: 'Revenue', before: '£50k/mo', after: '£125k/mo', improvement: '+150%' }
    ],
    images: ['/images/portfolio/project1-1.jpg', '/images/portfolio/project1-2.jpg'],
    tags: ['E-commerce', 'UI/UX', 'React', 'Conversion Optimization'],
    status: 'completed'
  },
  {
    id: '2',
    title: 'Mobile App Development',
    client: 'HealthTech Innovations',
    industry: 'Healthcare',
    completionDate: '2024-02-28',
    description: 'Native mobile application for healthcare management with real-time monitoring.',
    results: [
      { metric: 'User Adoption', before: '0', after: '10k users', improvement: 'New Launch' },
      { metric: 'App Store Rating', before: 'N/A', after: '4.8/5', improvement: 'Excellent' },
      { metric: 'Daily Active Users', before: '0', after: '3.2k', improvement: '32% retention' }
    ],
    images: ['/images/portfolio/project2-1.jpg'],
    tags: ['Mobile App', 'Healthcare', 'React Native', 'Real-time'],
    status: 'completed'
  }
];

const PortfolioSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('showcase');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || project.industry.toLowerCase() === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = ['all', ...Array.from(new Set(mockProjects.map(p => p.industry.toLowerCase())))];

  return (
    <PartnershipLayout
      title="Portfolio Showcase"
      subtitle="Demonstrate your expertise with successful client projects"
      actions={
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-green-400 mt-1">+3 this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">18</div>
              <p className="text-xs text-blue-400 mt-1">Across 6 industries</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg. ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">245%</div>
              <p className="text-xs text-green-400 mt-1">Client value increase</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">96%</div>
              <p className="text-xs text-purple-400 mt-1">Project completion</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger 
                value="showcase" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Showcase
              </TabsTrigger>
              <TabsTrigger 
                value="case-studies"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Case Studies
              </TabsTrigger>
              <TabsTrigger 
                value="metrics"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Success Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Project Showcase Tab */}
            <TabsContent value="showcase" className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects or clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md"
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>
                        {industry === 'all' ? 'All Industries' : industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
                            <p className="text-gray-400 text-sm mt-1">{project.client}</p>
                          </div>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {project.industry}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm">{project.description}</p>
                        
                        {/* Key Results Preview */}
                        <div className="grid grid-cols-2 gap-3">
                          {project.results.slice(0, 2).map((result, idx) => (
                            <div key={idx} className="bg-gray-700 p-3 rounded-lg">
                              <div className="text-xs text-gray-400">{result.metric}</div>
                              <div className="text-green-400 font-bold text-sm">{result.improvement}</div>
                            </div>
                          ))}
                        </div>

                        {/* Project Tags */}
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Case Studies Tab */}
            <TabsContent value="case-studies">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-500" />
                    Detailed Case Studies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Case studies feature coming soon. This will include detailed project breakdowns, 
                    methodologies, challenges overcome, and comprehensive results analysis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Success Metrics Tab */}
            <TabsContent value="metrics">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                    Success Metrics & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Advanced analytics dashboard coming soon. This will include ROI tracking, 
                    performance trends, client satisfaction scores, and industry benchmarks.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                    Project Timeline & Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Interactive timeline coming soon. This will show project progression, 
                    key milestones, and achievement history in a visual timeline format.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PartnershipLayout>
  );
};

export default PortfolioSection; 