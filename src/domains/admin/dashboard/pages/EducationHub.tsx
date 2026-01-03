import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { DashboardGreetingCard } from '@/components/ui/dashboard-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Award,
  Clock,
  CheckCircle,
  Lock,
  Download,
  Play,
  Calendar,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'video' | 'text' | 'quiz' | 'resource';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // percentage
  completed: boolean;
  locked: boolean;
  category: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  modules: string[];
  completionRate: number;
  earned: boolean;
  earnedDate?: string;
}

// Mock data
const mockModules: LearningModule[] = [
  {
    id: '1',
    title: 'Introduction to Affiliate Marketing',
    description: 'Learn the fundamentals of affiliate marketing and how to get started.',
    duration: 30,
    type: 'video',
    difficulty: 'beginner',
    progress: 100,
    completed: true,
    locked: false,
    category: 'Fundamentals'
  },
  {
    id: '2',
    title: 'Building Your First Referral Strategy',
    description: 'Develop effective strategies for acquiring and managing referrals.',
    duration: 45,
    type: 'video',
    difficulty: 'beginner',
    progress: 75,
    completed: false,
    locked: false,
    category: 'Strategy'
  },
  {
    id: '3',
    title: 'Advanced Commission Optimization',
    description: 'Maximize your earnings through advanced commission structures.',
    duration: 60,
    type: 'text',
    difficulty: 'advanced',
    progress: 0,
    completed: false,
    locked: true,
    category: 'Advanced'
  }
];

const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'Certified Partner Foundation',
    description: 'Master the basics of affiliate marketing',
    modules: ['1', '2'],
    completionRate: 87,
    earned: false
  },
  {
    id: '2',
    name: 'Advanced Partner Specialist',
    description: 'Advanced strategies and optimization techniques',
    modules: ['3', '4', '5'],
    completionRate: 0,
    earned: false
  }
];

const EducationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredModules = mockModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(mockModules.map(m => m.category.toLowerCase())))];
  const overallProgress = Math.round(mockModules.reduce((sum, module) => sum + module.progress, 0) / mockModules.length);

  return (
    <PartnershipLayout>
      <div className="space-y-8">
        {/* Smart Dashboard Greeting Card - New Header */}
        <DashboardGreetingCard 
          pageTitle="Education Hub"
          pageSubtitle="Enhance your skills and earn certifications to boost your success"
          showDate={true}
          pageContext={{
            pageType: 'education',
            keyMetrics: {
              primary: { value: '87%', label: 'Overall Progress', trend: 'Nearly certified!' },
              secondary: { value: '3/4', label: 'Certifications' }
            }
          }}
        />
      </div>
      <div className="space-y-6">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Overall Progress</CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed Modules</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mockModules.filter(m => m.completed).length}/{mockModules.length}
              </div>
              <p className="text-xs text-green-400 mt-1">Keep going!</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Learning Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Math.round(mockModules.reduce((sum, m) => sum + (m.duration * m.progress / 100), 0))}m
              </div>
              <p className="text-xs text-orange-400 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Certifications</CardTitle>
              <Award className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mockCertifications.filter(c => c.earned).length}/{mockCertifications.length}
              </div>
              <p className="text-xs text-orange-400 mt-1">Earned</p>
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
            <TabsList className="grid w-full grid-cols-5 bg-black border-orange-500/20">
              <TabsTrigger 
                value="modules" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Modules
              </TabsTrigger>
              <TabsTrigger 
                value="certifications"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Award className="w-4 h-4 mr-2" />
                Certifications
              </TabsTrigger>
              <TabsTrigger 
                value="resources"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger 
                value="webinars"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Webinars
              </TabsTrigger>
              <TabsTrigger 
                value="community"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Community
              </TabsTrigger>
            </TabsList>

            {/* Learning Modules Tab */}
            <TabsContent value="modules" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search learning modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black border-orange-500/20 text-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-black border border-orange-500/20 text-white rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`bg-black border-orange-500/20 ${
                      module.locked ? 'opacity-60' : 'hover:border-orange-500/50'
                    } transition-all duration-300`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              module.type === 'video' ? 'bg-red-500/20' : 
                              module.type === 'text' ? 'bg-blue-500/20' : 
                              'bg-green-500/20'
                            }`}>
                              {module.type === 'video' ? (
                                <Video className="w-4 h-4 text-red-400" />
                              ) : module.type === 'text' ? (
                                <FileText className="w-4 h-4 text-blue-400" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg flex items-center">
                                {module.title}
                                {module.locked && <Lock className="w-4 h-4 ml-2 text-gray-500" />}
                              </CardTitle>
                              <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                            </div>
                          </div>
                          <Badge className={`${
                            module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {module.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {module.duration} min
                          </span>
                          <span className="flex items-center">
                            {module.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <span>{module.progress}% complete</span>
                            )}
                          </span>
                        </div>
                        
                        <Progress value={module.progress} className="h-2" />
                        
                        <Button 
                          className={`w-full ${
                            module.locked 
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                              : module.completed 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                          disabled={module.locked}
                        >
                          {module.locked ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </>
                          ) : module.completed ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Review
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              {module.progress > 0 ? 'Continue' : 'Start'}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockCertifications.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-black border-orange-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Award className="w-5 h-5 mr-2 text-orange-500" />
                          {cert.name}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">{cert.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{cert.completionRate}%</span>
                          </div>
                          <Progress value={cert.completionRate} className="h-2" />
                        </div>
                        
                        <Button 
                          className={`w-full ${
                            cert.earned 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : cert.completionRate === 100
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-gray-700 text-gray-400'
                          }`}
                          disabled={cert.completionRate < 100 && !cert.earned}
                        >
                          {cert.earned ? (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              Earned
                            </>
                          ) : cert.completionRate === 100 ? (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              Claim Certificate
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Complete Modules
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs - placeholder content */}
            <TabsContent value="resources">
              <Card className="bg-black border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Download className="w-5 h-5 mr-2 text-orange-500" />
                    Downloadable Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Resource library coming soon. This will include marketing templates, 
                    guides, checklists, and other downloadable materials.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webinars">
              <Card className="bg-black border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                    Upcoming Webinars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Webinar schedule coming soon. Join live training sessions and 
                    Q&A with affiliate marketing experts.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community">
              <Card className="bg-black border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-orange-500" />
                    Partner Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center py-8">
                    Community features coming soon. Connect with other partners, 
                    share strategies, and get support from the community.
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

export default EducationHub; 