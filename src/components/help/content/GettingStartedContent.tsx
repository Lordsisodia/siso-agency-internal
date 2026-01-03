import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Layers, Settings, Users, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function GettingStartedContent() {
  const steps = [
    {
      title: "Setting Up Your Account",
      description: "Complete your profile and configure your initial settings to personalize your experience.",
      icon: <Settings className="h-6 w-6 text-siso-orange" />,
      timeEstimate: "5 min",
      completed: true
    },
    {
      title: "Creating Your First Project",
      description: "Learn how to create and manage projects using our intuitive interface.",
      icon: <Layers className="h-6 w-6 text-siso-orange" />,
      timeEstimate: "10 min",
      completed: false
    },
    {
      title: "Inviting Team Members",
      description: "Add team members and assign roles to collaborate effectively.",
      icon: <Users className="h-6 w-6 text-siso-orange" />,
      timeEstimate: "5 min",
      completed: false
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
        <BookOpen className="w-8 h-8 text-siso-orange" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Getting Started Guide</h1>
          <p className="text-gray-300">Follow this step-by-step guide to set up your account and start using the platform</p>
        </div>
      </div>
      
      {/* Welcome Card */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-black/70 to-black/50 border-gray-800 mb-8 shadow-lg">
          <CardHeader className="pb-2">
            <Badge className="self-start mb-2 bg-siso-orange/30 text-siso-orange border-none">New User Guide</Badge>
            <CardTitle className="text-2xl text-white">Welcome to the Platform</CardTitle>
            <CardDescription className="text-base text-gray-300">
              This guide will help you get started with our platform. Follow these steps
              to make the most of your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="bg-black/50 p-4 rounded-lg border border-gray-800 flex items-center gap-3 flex-1 hover:border-green-500/30 transition-colors">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Progress</p>
                  <p className="text-lg font-semibold text-white">33% Complete</p>
                </div>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-gray-800 flex items-center gap-3 flex-1 hover:border-blue-500/30 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estimated Time</p>
                  <p className="text-lg font-semibold text-white">20 minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Cards */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div 
            key={index} 
            variants={item}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className={`border-l-4 ${step.completed ? 'border-l-green-500' : 'border-l-gray-600'} bg-black/60 border-t border-r border-b border-gray-800 shadow-lg`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center mr-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500/30 text-green-400' : 'bg-gray-800 text-gray-300'}`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-full w-0.5 mt-2 ${step.completed ? 'bg-green-500/40' : 'bg-gray-700'}`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center text-white">
                          {step.title}
                          {step.completed && (
                            <Badge className="ml-2 bg-green-500/30 text-green-400 border-none">Completed</Badge>
                          )}
                        </h3>
                        <p className="text-gray-300 mt-1">{step.description}</p>
                      </div>
                      <Badge variant="outline" className="bg-black/60 border-gray-700 text-gray-300">
                        {step.timeEstimate}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant={step.completed ? "outline" : "default"} 
                        className={step.completed ? "bg-transparent border-green-500 text-green-400 hover:bg-green-500/10 shadow-md" : "shadow-md"}
                      >
                        {step.completed ? "View Again" : "Start Step"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Additional Resources */}
      <motion.div variants={item}>
        <Card className="bg-black/60 border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white">Additional Resources</CardTitle>
            <CardDescription className="text-gray-300">
              Explore these resources to learn more about advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start bg-black/50 border-gray-700 hover:bg-black/70 text-white hover:text-siso-orange hover:border-siso-orange/30 transition-colors"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Platform Documentation
            </Button>
            <Button 
              variant="outline" 
              className="justify-start bg-black/50 border-gray-700 hover:bg-black/70 text-white hover:text-siso-orange hover:border-siso-orange/30 transition-colors"
            >
              <Users className="mr-2 h-4 w-4" />
              Collaboration Guide
            </Button>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
