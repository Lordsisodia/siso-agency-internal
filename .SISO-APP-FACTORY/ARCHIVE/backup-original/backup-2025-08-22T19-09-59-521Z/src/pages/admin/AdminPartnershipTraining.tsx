import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import StatsCard from '@/components/dashboard/StatsCard';
import { EnhancedProgressCard } from '@/components/dashboard/EnhancedProgressCard';
import { RecentActivityCard } from '@/components/dashboard/cards/RecentActivityCard';
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock,
  Video,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Star,
  TrendingUp,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPartnershipTraining = () => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Courses",
      value: "24",
      trend: "+4 new this month",
      icon: BookOpen,
      trendUp: true
    },
    {
      title: "Active Learners",
      value: "98",
      trend: "73% of partners",
      icon: Users,
      trendUp: true
    },
    {
      title: "Avg Completion",
      value: "68%",
      trend: "+12% improvement",
      icon: Target,
      trendUp: true
    },
    {
      title: "Certifications",
      value: "156",
      trend: "+23 this month",
      icon: Award,
      trendUp: true
    }
  ];

  const coursesData = [
    {
      id: '1',
      title: 'Partnership Fundamentals',
      category: 'getting_started',
      type: 'video',
      duration: 45,
      enrollments: 134,
      completions: 98,
      rating: 4.8,
      status: 'published',
      lastUpdated: '2024-01-10'
    },
    {
      id: '2',
      title: 'Advanced Sales Techniques',
      category: 'sales',
      type: 'video',
      duration: 60,
      enrollments: 89,
      completions: 56,
      rating: 4.9,
      status: 'published',
      lastUpdated: '2024-01-08'
    },
    {
      id: '3',
      title: 'Client Communication Mastery',
      category: 'communication',
      type: 'reading',
      duration: 30,
      enrollments: 112,
      completions: 87,
      rating: 4.7,
      status: 'published',
      lastUpdated: '2024-01-05'
    },
    {
      id: '4',
      title: 'Commission Calculator Tutorial',
      category: 'tools',
      type: 'interactive',
      duration: 15,
      enrollments: 145,
      completions: 143,
      rating: 4.9,
      status: 'published',
      lastUpdated: '2024-01-03'
    },
    {
      id: '5',
      title: 'Lead Generation Strategies',
      category: 'marketing',
      type: 'video',
      duration: 50,
      enrollments: 67,
      completions: 34,
      rating: 4.6,
      status: 'draft',
      lastUpdated: '2024-01-15'
    }
  ];

  const webinarsData = [
    {
      id: '1',
      title: 'Q1 Partnership Kickoff',
      speaker: 'John Doe, CEO',
      date: '2024-02-01',
      time: '2:00 PM EST',
      registrations: 87,
      maxCapacity: 100,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Advanced Referral Strategies',
      speaker: 'Sarah Smith, VP Sales',
      date: '2024-02-15',
      time: '3:00 PM EST',
      registrations: 45,
      maxCapacity: 75,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Partner Success Stories',
      speaker: 'Multiple Partners',
      date: '2024-01-15',
      time: '2:00 PM EST',
      registrations: 92,
      attendance: 78,
      status: 'completed'
    }
  ];

  const resourcesData = [
    { name: 'Sales Script Templates', type: 'document', downloads: 234, category: 'sales' },
    { name: 'Brand Guidelines', type: 'pdf', downloads: 156, category: 'marketing' },
    { name: 'Commission Structure Guide', type: 'document', downloads: 189, category: 'program' },
    { name: 'Email Templates Pack', type: 'zip', downloads: 201, category: 'marketing' },
    { name: 'Case Study Collection', type: 'pdf', downloads: 145, category: 'sales' }
  ];

  const learningActivities = [
    {
      id: '1',
      title: 'Course completed',
      description: 'Michael Chen completed "Advanced Sales Techniques"',
      timestamp: new Date(),
      icon: 'check-circle',
      type: 'course' as const
    },
    {
      id: '2',
      title: 'Certification earned',
      description: 'Sarah Johnson earned Gold Partner certification',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'award',
      type: 'achievement' as const
    },
    {
      id: '3',
      title: 'Webinar registration',
      description: '12 partners registered for Q1 Kickoff',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'calendar',
      type: 'event' as const
    },
    {
      id: '4',
      title: 'Resource downloaded',
      description: 'Sales Script Templates downloaded 15 times today',
      timestamp: new Date(Date.now() - 10800000),
      icon: 'download',
      type: 'resource' as const
    }
  ];

  const courseColumns = [
    { key: 'title', label: 'Course Title', sortable: true },
    { 
      key: 'category', 
      label: 'Category',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (value: string) => {
        const icons = {
          video: <Video className="h-4 w-4" />,
          reading: <FileText className="h-4 w-4" />,
          interactive: <Star className="h-4 w-4" />
        };
        return (
          <div className="flex items-center gap-2">
            {icons[value as keyof typeof icons]}
            <span className="capitalize">{value}</span>
          </div>
        );
      }
    },
    { key: 'duration', label: 'Duration', render: (value: number) => `${value} min` },
    { key: 'enrollments', label: 'Enrollments', sortable: true },
    { 
      key: 'completions', 
      label: 'Completion Rate',
      render: (_: any, row: any) => {
        const rate = (row.completions / row.enrollments * 100).toFixed(1);
        return `${rate}%`;
      }
    },
    { 
      key: 'rating', 
      label: 'Rating',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={value === 'published' ? 'bg-green-500' : 'bg-gray-500'}>
          {value}
        </Badge>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminPageTitle 
            title="Partnership Training Hub" 
            description="Manage training content and track partner learning progress"
          />
          <Button className="bg-siso-primary hover:bg-siso-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
              trendUp={stat.trendUp}
            />
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="webinars">Webinars</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-siso-bg-alt border-siso-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Course Management</h3>
                  <div className="flex items-center gap-2">
                    {selectedCourses.length > 0 && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <EnhancedTable
                  data={coursesData}
                  columns={courseColumns}
                  onSelectionChange={setSelectedCourses}
                  selectable
                />
              </div>
            </Card>

            {/* Learning Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4">Category Completion Rates</h3>
                <EnhancedProgressCard
                  title="Course Categories"
                  progress={[
                    { label: "Getting Started", value: 85, color: "bg-green-500" },
                    { label: "Sales Training", value: 68, color: "bg-blue-500" },
                    { label: "Marketing", value: 72, color: "bg-purple-500" },
                    { label: "Advanced", value: 45, color: "bg-orange-500" }
                  ]}
                  showPercentage
                />
              </Card>

              <RecentActivityCard
                activities={learningActivities}
                title="Recent Learning Activity"
              />
            </div>
          </TabsContent>

          <TabsContent value="webinars" className="space-y-6">
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Upcoming Webinars</h3>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Webinar
                </Button>
              </div>
              <div className="space-y-4">
                {webinarsData.map((webinar) => (
                  <div key={webinar.id} className="p-4 rounded-lg bg-siso-bg border border-siso-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{webinar.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">Speaker: {webinar.speaker}</p>
                        <p className="text-sm text-gray-400">
                          {webinar.date} at {webinar.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {webinar.registrations}/{webinar.maxCapacity || webinar.attendance} 
                        </p>
                        <p className="text-xs text-gray-400">
                          {webinar.status === 'upcoming' ? 'Registered' : 'Attended'}
                        </p>
                        <Badge 
                          className="mt-2"
                          variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}
                        >
                          {webinar.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Resource Library</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resourcesData.map((resource) => (
                  <div key={resource.name} className="p-4 rounded-lg bg-siso-bg border border-siso-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white">{resource.name}</h4>
                          <p className="text-sm text-gray-400">
                            {resource.type.toUpperCase()} • {resource.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{resource.downloads}</p>
                        <p className="text-xs text-gray-400">downloads</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4">Learning Engagement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Avg. Time per Course</span>
                    <span className="text-sm font-medium text-white">38 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Course Completion Rate</span>
                    <span className="text-sm font-medium text-white">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Certification Pass Rate</span>
                    <span className="text-sm font-medium text-white">82%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Active Learning Streak</span>
                    <span className="text-sm font-medium text-white">4.2 days avg</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Impact</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-siso-bg border border-siso-border">
                    <p className="text-sm text-gray-400">Partners who complete training</p>
                    <p className="text-lg font-semibold text-siso-primary">+47% higher earnings</p>
                  </div>
                  <div className="p-3 rounded-lg bg-siso-bg border border-siso-border">
                    <p className="text-sm text-gray-400">Certified partners convert</p>
                    <p className="text-lg font-semibold text-siso-primary">2.3x more leads</p>
                  </div>
                  <div className="p-3 rounded-lg bg-siso-bg border border-siso-border">
                    <p className="text-sm text-gray-400">Training ROI</p>
                    <p className="text-lg font-semibold text-siso-primary">312% return</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievement System Stats */}
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Achievement Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
                  <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-sm text-gray-400">Total Badges Earned</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">89</p>
                  <p className="text-sm text-gray-400">Skill Certifications</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">67</p>
                  <p className="text-sm text-gray-400">Active Learners</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">2,834</p>
                  <p className="text-sm text-gray-400">Total Hours Learned</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipTraining;