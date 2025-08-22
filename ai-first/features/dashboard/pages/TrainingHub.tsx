import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardGreetingCard } from '@/components/ui/dashboard-templates';
import { 
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Download,
  Play,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Target,
  Globe,
  TrendingUp,
  Star,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Presentation
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'resource';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  completed: boolean;
  locked: boolean;
  category: string;
}

interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  courseCount: number;
  color: string;
  topics: string[];
}

interface Webinar {
  id: string;
  title: string;
  presenter: string;
  date: string;
  time: string;
  duration: number;
  status: 'register' | 'live' | 'completed';
  description: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'template' | 'checklist';
  size: string;
  downloads: number;
  category: string;
}

// Mock data for progress dashboard
const learningStats = {
  coursesCompleted: 12,
  hoursLearned: 48,
  certificationsEarned: 3,
  skillLevel: 'Advanced',
  monthlyProgress: 85,
  totalCourses: 26
};

// Featured learning path
const featuredLearningPath = {
  title: "Partner Success Mastery",
  description: "Complete learning path for becoming a successful SISO partner",
  progress: 60,
  modules: [
    { title: "Referral Strategies", status: "completed", icon: CheckCircle2 },
    { title: "Client Communication", status: "in-progress", icon: Play },
    { title: "Closing Techniques", status: "locked", icon: Lock },
    { title: "Advanced Partnerships", status: "locked", icon: Lock }
  ]
};

// Course categories
const courseCategories: CourseCategory[] = [
  {
    id: '1',
    name: 'Sales & Marketing',
    description: 'Master the art of selling and marketing strategies',
    icon: Target,
    courseCount: 8,
    color: 'text-orange-400',
    topics: ['Lead Gen', 'Closing', 'Negotiation']
  },
  {
    id: '2',
    name: 'Technical Skills',
    description: 'Learn app development and technical fundamentals',
    icon: Zap,
    courseCount: 12,
    color: 'text-orange-400',
    topics: ['App Dev', 'Tech Stack', 'APIs']
  },
  {
    id: '3',
    name: 'Business Development',
    description: 'Strategic business planning and development',
    icon: TrendingUp,
    courseCount: 6,
    color: 'text-orange-400',
    topics: ['Strategy', 'Planning', 'Finance']
  },
  {
    id: '4',
    name: 'Client Relations',
    description: 'Build and maintain strong client relationships',
    icon: Users,
    courseCount: 5,
    color: 'text-orange-400',
    topics: ['Communication', 'Support', 'Retention']
  },
  {
    id: '5',
    name: 'Industry Knowledge',
    description: 'Stay up-to-date with industry trends and insights',
    icon: Globe,
    courseCount: 9,
    color: 'text-orange-400',
    topics: ['Trends', 'Best Practice', 'Case Studies']
  },
  {
    id: '6',
    name: 'Tools & Resources',
    description: 'Master essential tools and resources for success',
    icon: BookOpen,
    courseCount: 15,
    color: 'text-orange-400',
    topics: ['Software', 'Templates', 'Checklists']
  }
];

// Upcoming webinars
const upcomingWebinars: Webinar[] = [
  {
    id: '1',
    title: 'Advanced Referral Strategies',
    presenter: 'Sarah Johnson',
    date: '2025-01-28',
    time: '2:00 PM',
    duration: 60,
    status: 'register',
    description: 'Learn proven strategies to maximize your referral conversions'
  },
  {
    id: '2',
    title: 'App Development Trends 2025',
    presenter: 'Mike Chen',
    date: '2025-02-05',
    time: '10:00 AM',
    duration: 45,
    status: 'register',
    description: 'Stay ahead of the latest trends in mobile app development'
  },
  {
    id: '3',
    title: 'Client Retention Masterclass',
    presenter: 'Emma Davis',
    date: '2025-02-12',
    time: '3:00 PM',
    duration: 90,
    status: 'register',
    description: 'Master the techniques to keep clients engaged and satisfied'
  }
];

// Resource library
const resourceLibrary: Resource[] = [
  { id: '1', title: 'Partner Handbook', type: 'pdf', size: '2.3MB', downloads: 1247, category: 'Documents' },
  { id: '2', title: 'Sales Playbook', type: 'pdf', size: '1.8MB', downloads: 892, category: 'Documents' },
  { id: '3', title: 'Technical Specifications', type: 'pdf', size: '3.1MB', downloads: 654, category: 'Documents' },
  { id: '4', title: 'Proposal Templates', type: 'template', size: '1.2MB', downloads: 1456, category: 'Templates' },
  { id: '5', title: 'Email Templates', type: 'template', size: '0.8MB', downloads: 1789, category: 'Templates' },
  { id: '6', title: 'Onboarding Series', type: 'video', size: '156MB', downloads: 567, category: 'Videos' }
];

const TrainingHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <PartnershipLayout>
      <div className="space-y-8">
      
        {/* Smart Dashboard Greeting Card - New Header */}
        <DashboardGreetingCard 
          pageTitle="Training & Development Hub"
          pageSubtitle="Master your skills and accelerate your partner success with comprehensive learning resources"
          showDate={true}
          pageContext={{
            pageType: 'training',
            keyMetrics: {
              primary: { value: '67%', label: 'Course Progress', trend: 'On track' },
              secondary: { value: '8/12', label: 'Modules Complete' }
            }
          }}
        />
        {/* Learning Progress Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Courses Completed</CardTitle>
              <BookOpen className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningStats.coursesCompleted}</div>
              <p className="text-xs text-orange-400 mt-1">This Month</p>
              <div className="text-sm text-gray-400 mt-1">
                {learningStats.coursesCompleted}/{learningStats.totalCourses} Total
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Hours Learned</CardTitle>
              <Clock className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningStats.hoursLearned}</div>
              <p className="text-xs text-orange-400 mt-1">Total Time</p>
              <div className="text-sm text-gray-400 mt-1">Average: 2.4hrs/week</div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Certifications</CardTitle>
              <Award className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningStats.certificationsEarned}</div>
              <p className="text-xs text-orange-400 mt-1">Badges</p>
              <div className="text-sm text-gray-400 mt-1">Gold level achieved</div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Skill Level</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningStats.skillLevel}</div>
              <p className="text-xs text-orange-400 mt-1">Overall</p>
              <Progress value={learningStats.monthlyProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </motion.section>

        {/* Featured Learning Path */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-black border border-orange-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Star className="w-5 h-5 text-orange-400 mr-2" />
                    Recommended for You
                  </CardTitle>
                  <p className="text-gray-400 mt-1">Continue your learning journey</p>
                </div>
                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Featured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🚀 {featuredLearningPath.title}</h3>
                <p className="text-gray-400 mb-4">{featuredLearningPath.description}</p>
                
                <div className="space-y-3">
                  {featuredLearningPath.modules.map((module, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-1 rounded-full ${
                        module.status === 'completed' ? 'bg-green-500/20' :
                        module.status === 'in-progress' ? 'bg-orange-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        <module.icon className={`w-4 h-4 ${
                          module.status === 'completed' ? 'text-green-400' :
                          module.status === 'in-progress' ? 'text-orange-400' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <span className={`${
                        module.status === 'completed' ? 'text-green-400' :
                        module.status === 'in-progress' ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        Module {index + 1}: {module.title}
                      </span>
                      {module.status === 'completed' && (
                        <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs">
                          ✅ Completed
                        </Badge>
                      )}
                      {module.status === 'in-progress' && (
                        <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                          📚 In Progress
                        </Badge>
                      )}
                      {module.status === 'locked' && (
                        <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs">
                          🔒 Locked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{featuredLearningPath.progress}% Complete</span>
                  </div>
                  <Progress value={featuredLearningPath.progress} className="h-3" />
                </div>

                <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white border-orange-500/30">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Course Categories Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Course Categories</h2>
            <p className="text-gray-400">Explore our comprehensive learning library</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-black border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 h-full group-hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <category.icon className={`w-8 h-8 ${category.color}`} />
                      <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {category.courseCount} Courses
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white group-hover:text-orange-100">
                      {category.name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {category.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                          {topic}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/50"
                    >
                      Explore Courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Upcoming Webinars */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Calendar className="w-5 h-5 text-orange-400 mr-2" />
                Upcoming Webinars
              </CardTitle>
              <p className="text-gray-400">Join live training sessions with industry experts</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingWebinars.map((webinar, index) => (
                  <motion.div
                    key={webinar.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">{webinar.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{webinar.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-orange-400" />
                            {webinar.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-orange-400" />
                            {webinar.time}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-orange-400" />
                            {webinar.presenter}
                          </span>
                          <span>{webinar.duration} min</span>
                        </div>
                      </div>
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white ml-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        Register
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Resource Library */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <FileText className="w-5 h-5 text-orange-400 mr-2" />
                Resource Library
              </CardTitle>
              <p className="text-gray-400">Download templates, guides, and tools to accelerate your success</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourceLibrary.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        resource.type === 'pdf' ? 'bg-red-500/20' :
                        resource.type === 'video' ? 'bg-blue-500/20' :
                        resource.type === 'template' ? 'bg-green-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {resource.type === 'pdf' ? (
                          <FileText className="w-5 h-5 text-red-400" />
                        ) : resource.type === 'video' ? (
                          <Video className="w-5 h-5 text-blue-400" />
                        ) : resource.type === 'template' ? (
                          <Download className="w-5 h-5 text-green-400" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                    
                    <h5 className="text-white font-medium mb-2 group-hover:text-orange-100">{resource.title}</h5>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{resource.size}</span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Achievements & Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Achievements */}
          <Card className="bg-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Award className="w-5 h-5 text-orange-400 mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Award className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h5 className="text-white font-medium">Sales Fundamentals</h5>
                    <p className="text-green-400 text-sm">Certification earned</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="p-2 bg-orange-500/20 rounded-full">
                    <Star className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h5 className="text-white font-medium">5-Course Streak</h5>
                    <p className="text-orange-400 text-sm">Learning momentum</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-white font-medium">Top 10 Learner</h5>
                    <p className="text-blue-400 text-sm">Community recognition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Zap className="w-5 h-5 text-orange-400 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Courses
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Join Next Webinar
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resources
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Study Group
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PartnershipLayout>
  );
};

export default TrainingHub; 