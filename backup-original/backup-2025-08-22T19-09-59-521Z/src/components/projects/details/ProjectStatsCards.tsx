import { Card } from "@/components/ui/card";
import { Users, Code, CheckSquare, Clock, Calendar, Settings, CreditCard, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor, 
  delay = 0,
  progress,
  subtitle,
  linkText,
  linkHref
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  bgColor: string; 
  textColor: string; 
  delay?: number;
  progress?: number;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
              <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          {progress !== undefined && (
            <div className="mt-4">
              <Progress 
                value={progress} 
                className="h-1.5" 
                indicatorClassName={`${progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-amber-500' : 'bg-[#ea384c]'}`} 
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-gray-500">{progress}% Complete</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs py-0 px-1.5 ${
                    progress >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    progress >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-[#ea384c]/10 text-[#ea384c] border-[#ea384c]/20'
                  }`}
                >
                  {progress >= 70 ? 'On track' : progress >= 40 ? 'In progress' : 'Needs attention'}
                </Badge>
              </div>
            </div>
          )}

          {linkText && linkHref && (
            <div className="mt-auto pt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function MessageCard({
  title,
  icon,
  bgColor,
  textColor,
  messages,
  delay = 0,
  linkText,
  linkHref
}: {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  messages: Array<{text: string, time?: string}>;
  delay?: number;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          <div className="flex-grow space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="p-3 bg-black/20 border border-white/5 rounded-lg">
                <p className="text-sm text-white">{message.text}</p>
                {message.time && <p className="text-xs text-gray-500 mt-1">{message.time}</p>}
              </div>
            ))}
          </div>

          {linkText && linkHref && (
            <div className="mt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function PhaseProgressCard({
  title,
  icon,
  bgColor,
  textColor,
  phases,
  delay = 0,
  linkText,
  linkHref
}: {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  phases: Array<{name: string, progress: number}>;
  delay?: number;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          <div className="flex-grow space-y-4">
            {phases.map((phase, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">{phase.name}</span>
                  <span className="text-sm text-gray-400">{phase.progress}%</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      phase.progress === 100 ? 'bg-green-500' : 
                      phase.progress > 0 ? 'bg-amber-500' : 
                      'bg-gray-600'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs py-0 px-1.5 ${
                      phase.progress === 100 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      phase.progress > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}
                  >
                    {phase.progress === 100 ? 'Complete' : phase.progress > 0 ? 'In progress' : 'Upcoming'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {linkText && linkHref && (
            <div className="mt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function FeatureCard({
  title,
  icon,
  bgColor,
  textColor,
  currentFeature,
  progress,
  delay = 0,
  linkText,
  linkHref
}: {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  currentFeature: string;
  progress: number;
  delay?: number;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          <div className="flex-grow">
            <p className="text-xl font-medium text-white mb-2">{currentFeature}</p>
            <Progress 
              value={progress} 
              className="h-1.5" 
              indicatorClassName={`${progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-amber-500' : 'bg-[#ea384c]'}`} 
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-500">{progress}% Complete</p>
              <Badge 
                variant="outline" 
                className={`text-xs py-0 px-1.5 ${
                  progress >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  progress >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-[#ea384c]/10 text-[#ea384c] border-[#ea384c]/20'
                }`}
              >
                {progress >= 70 ? 'On track' : progress >= 40 ? 'In progress' : 'Needs attention'}
              </Badge>
            </div>
          </div>

          {linkText && linkHref && (
            <div className="mt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function PaymentScheduleCard({
  title,
  icon,
  bgColor,
  textColor,
  nextPayment,
  totalBudget,
  delay = 0,
  linkText,
  linkHref
}: {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  nextPayment: {amount: string, description: string, dueDate: string};
  totalBudget: string;
  delay?: number;
  linkText?: string;
  linkHref?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="p-4 bg-black/20 rounded-lg border border-white/5 mb-3">
              <p className="text-sm font-medium text-white mb-1">Next Payment</p>
              <p className="text-xl font-bold text-white">{nextPayment.amount}</p>
              <p className="text-xs text-gray-400 mt-1">{nextPayment.description}</p>
              <Badge 
                variant="outline" 
                className="mt-2 bg-amber-500/10 text-amber-400 border-amber-500/20"
              >
                {nextPayment.dueDate}
              </Badge>
            </div>
          </div>

          {linkText && linkHref && (
            <div className="mt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function ProjectStatsCards() {
  // This would be replaced with actual data from your backend
  const stats = {
    overallProgress: 25,
    timelineRemaining: {
      days: 35,
      endDate: "June 6, 2025",
      percentComplete: 25
    },
    nextMilestone: {
      name: "Phase 1 Completion",
      date: "May 21, 2025",
      tasksCompleted: 3,
      totalTasks: 6,
      percentComplete: 50
    },
    credits: {
      spent: 614,
      tokens: 78592000,
      cost: 153.50,
      totalBudget: "£6,000"
    },
    outstandingActions: [
      {
        text: "Make Upfront Payment (£900)",
        time: "Due today"
      }
    ],
    messages: [
      {
        text: "New message: Web3 integration update",
        time: "1 hour ago"
      },
      {
        text: "Completed Initial Setup & Planning",
        time: "May 2, 2025"
      }
    ],
    phases: [
      { name: "Phase 1: Initial Setup & Web3 Integration", progress: 50 },
      { name: "Phase 2: UI & Dashboard", progress: 0 },
      { name: "Phase 3: P2P, Staking, Security", progress: 0 },
      { name: "Phase 4: Community, Final Testing", progress: 0 }
    ],
    currentFeature: {
      name: "Web3 Wallet Integration",
      progress: 50
    },
    paymentSchedule: {
      nextPayment: {
        amount: "£900",
        description: "Upfront Payment",
        dueDate: "Due Today"
      },
      totalBudget: "£6,000"
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard 
        title="Overall Progress"
        value="25%"
        subtitle="1.5 weeks out of 6"
        icon={<CheckSquare className="h-6 w-6 text-[#ea384c]" />}
        bgColor="bg-gradient-to-br from-[#ea384c]/10 to-red-900/5"
        textColor="text-[#ea384c]"
        delay={0}
        progress={stats.overallProgress}
        linkText="View Timeline"
        linkHref="/projects/ubahcrypt/timeline"
      />
      
      <StatCard 
        title="Timeline Remaining"
        value={`${stats.timelineRemaining.days} days`}
        subtitle={`until ${stats.timelineRemaining.endDate}`}
        icon={<Clock className="h-6 w-6 text-red-400" />}
        bgColor="bg-gradient-to-br from-red-500/10 to-red-700/5"
        textColor="text-red-400"
        delay={1}
        progress={stats.timelineRemaining.percentComplete}
        linkText="View Timeline"
        linkHref="/projects/ubahcrypt/timeline"
      />
      
      <StatCard 
        title="Next Milestone"
        value={stats.nextMilestone.name}
        subtitle={`${stats.nextMilestone.date} (${stats.nextMilestone.tasksCompleted}/${stats.nextMilestone.totalTasks} tasks)`}
        icon={<CheckSquare className="h-6 w-6 text-[#ea384c]" />}
        bgColor="bg-gradient-to-br from-[#ea384c]/10 to-red-900/5"
        textColor="text-[#ea384c]"
        delay={2}
        progress={stats.nextMilestone.percentComplete}
        linkText="View Tasks"
        linkHref="/projects/ubahcrypt/active-tasks"
      />
      
      <StatCard 
        title="Credits Spent"
        value={`£${stats.credits.cost}`}
        subtitle={`${stats.credits.spent} credits (${(stats.credits.tokens/1000000).toFixed(1)}M tokens)`}
        icon={<CreditCard className="h-6 w-6 text-red-400" />}
        bgColor="bg-gradient-to-br from-red-500/10 to-red-700/5"
        textColor="text-red-400"
        delay={3}
        linkText="View Financial Details"
        linkHref="/projects/ubahcrypt/financial"
      />
      
      <MessageCard
        title="Outstanding Actions"
        icon={<CheckSquare className="h-6 w-6 text-amber-400" />}
        bgColor="bg-gradient-to-br from-amber-500/10 to-amber-700/5"
        textColor="text-amber-400"
        messages={stats.outstandingActions}
        delay={4}
        linkText="View Tasks"
        linkHref="/projects/ubahcrypt/active-tasks"
      />
      
      <MessageCard
        title="Messages & Updates"
        icon={<FileText className="h-6 w-6 text-blue-400" />}
        bgColor="bg-gradient-to-br from-blue-500/10 to-blue-700/5"
        textColor="text-blue-400"
        messages={stats.messages}
        delay={5}
        linkText="View Messages"
        linkHref="#"
      />
      
      <PhaseProgressCard
        title="Phase Progress"
        icon={<Code className="h-6 w-6 text-purple-400" />}
        bgColor="bg-gradient-to-br from-purple-500/10 to-purple-700/5"
        textColor="text-purple-400"
        phases={stats.phases}
        delay={6}
        linkText="View Timeline"
        linkHref="/projects/ubahcrypt/timeline"
      />
      
      <FeatureCard
        title="Active Features"
        icon={<Settings className="h-6 w-6 text-green-400" />}
        bgColor="bg-gradient-to-br from-green-500/10 to-green-700/5"
        textColor="text-green-400"
        currentFeature={stats.currentFeature.name}
        progress={stats.currentFeature.progress}
        delay={7}
        linkText="View App Plan"
        linkHref="/projects/ubahcrypt/app-plan"
      />
      
      <PaymentScheduleCard
        title="Payment Schedule"
        icon={<Calendar className="h-6 w-6 text-indigo-400" />}
        bgColor="bg-gradient-to-br from-indigo-500/10 to-indigo-700/5"
        textColor="text-indigo-400"
        nextPayment={stats.paymentSchedule.nextPayment}
        totalBudget={stats.paymentSchedule.totalBudget}
        delay={8}
        linkText="View Financial Details"
        linkHref="/projects/ubahcrypt/financial"
      />
    </div>
  );
}
