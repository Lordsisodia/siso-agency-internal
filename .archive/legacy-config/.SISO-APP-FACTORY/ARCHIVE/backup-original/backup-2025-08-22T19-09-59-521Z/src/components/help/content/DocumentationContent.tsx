import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, BookOpen, Code, Terminal, Database, Server, ArrowRight, Globe, Shield, Settings, UserPlus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DocCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  topics: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export function DocumentationContent() {
  const docCategories: DocCategory[] = [
    {
      title: "Getting Started",
      description: "Essential documentation for new users",
      icon: <BookOpen className="h-6 w-6 text-siso-orange" />,
      topics: [
        {
          title: "Platform Overview",
          description: "Learn about the core features and capabilities",
          icon: <Globe className="h-5 w-5 text-siso-orange" />
        },
        {
          title: "Account Setup",
          description: "Complete your profile and configure your settings",
          icon: <Settings className="h-5 w-5 text-siso-orange" />
        },
        {
          title: "Team Management",
          description: "Invite and manage team members",
          icon: <UserPlus className="h-5 w-5 text-siso-orange" />
        }
      ]
    },
    {
      title: "API Reference",
      description: "Comprehensive API documentation for developers",
      icon: <Code className="h-6 w-6 text-blue-400" />,
      badge: "Technical",
      badgeColor: "bg-blue-500/30 text-blue-400 border-blue-500/30",
      topics: [
        {
          title: "Authentication",
          description: "API authentication methods and security",
          icon: <Shield className="h-5 w-5 text-blue-400" />
        },
        {
          title: "Endpoints",
          description: "Available API endpoints and usage examples",
          icon: <Terminal className="h-5 w-5 text-blue-400" />
        },
        {
          title: "Data Models",
          description: "Core data structures and object schemas",
          icon: <Database className="h-5 w-5 text-blue-400" />
        }
      ]
    },
    {
      title: "Integration Guides",
      description: "Connect with external services and platforms",
      icon: <Server className="h-6 w-6 text-purple-400" />,
      badge: "Advanced",
      badgeColor: "bg-purple-500/30 text-purple-400 border-purple-500/30",
      topics: [
        {
          title: "Third-party Services",
          description: "Connect with popular external services",
          icon: <Globe className="h-5 w-5 text-purple-400" />
        },
        {
          title: "Webhooks",
          description: "Set up and manage webhook integrations",
          icon: <Terminal className="h-5 w-5 text-purple-400" />
        },
        {
          title: "SSO Implementation",
          description: "Implement single sign-on authentication",
          icon: <Shield className="h-5 w-5 text-purple-400" />
        }
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-siso-orange/20 rounded-lg">
          <FileText className="w-8 h-8 text-siso-orange" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Documentation</h1>
          <p className="text-gray-300">Comprehensive guides, tutorials, and API references</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {docCategories.map((category, index) => (
          <motion.div
            key={index}
            variants={item}
            className="h-full"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="bg-black/60 border-gray-800 h-full flex flex-col shadow-lg hover:border-gray-600 transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-lg bg-black/70 border border-gray-700 flex items-center justify-center">
                    {category.icon}
                  </div>
                  {category.badge && (
                    <Badge className={category.badgeColor}>
                      {category.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-xl text-white">{category.title}</CardTitle>
                <CardDescription className="text-gray-300">{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-grow">
                <div className="space-y-4 mt-4">
                  {category.topics.map((topic, topicIndex) => (
                    <div 
                      key={topicIndex} 
                      className="flex gap-3 p-3 rounded-lg bg-black/70 border border-gray-800/50 hover:border-gray-600 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-black/80 flex items-center justify-center flex-shrink-0">
                        {topic.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{topic.title}</h3>
                        <p className="text-sm text-gray-300">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full bg-black/70 border-gray-700 hover:bg-black/90 text-white hover:text-siso-orange hover:border-siso-orange/30 shadow-md"
                >
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resources Section */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-black/70 to-black/50 border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white">Additional Resources</CardTitle>
            <CardDescription className="text-gray-300">
              Explore these resources to enhance your understanding of our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start bg-black/70 border-gray-700 hover:bg-black/90 text-white hover:text-blue-400 hover:border-blue-500/30 transition-colors shadow-md"
            >
              <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
              Developer Guides
            </Button>
            <Button 
              variant="outline" 
              className="justify-start bg-black/70 border-gray-700 hover:bg-black/90 text-white hover:text-purple-400 hover:border-purple-500/30 transition-colors shadow-md"
            >
              <Terminal className="mr-2 h-4 w-4 text-purple-400" />
              Code Examples
            </Button>
            <Button 
              variant="outline" 
              className="justify-start bg-black/70 border-gray-700 hover:bg-black/90 text-white hover:text-green-400 hover:border-green-500/30 transition-colors shadow-md"
            >
              <Globe className="mr-2 h-4 w-4 text-green-400" />
              Community Forums
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
