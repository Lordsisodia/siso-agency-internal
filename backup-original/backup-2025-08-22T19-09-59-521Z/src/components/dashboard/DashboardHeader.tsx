
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function DashboardHeader() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState("Hello");
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <motion.div 
      className="flex flex-col gap-6 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
            {greeting}, {user?.email ? user.email.split('@')[0] : 'User'}
          </h1>
          <p className="text-siso-text mt-1">
            Welcome to your Agency Management Platform
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-siso-text" />
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-black/30 border border-siso-text/10 rounded-lg text-siso-text focus:outline-none focus:border-siso-orange/50 w-full md:w-[220px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            className="relative bg-black/30 border-siso-text/10 hover:bg-siso-bg-alt hover:border-siso-border-hover"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-siso-red rounded-full flex items-center justify-center text-[10px] text-white">
              3
            </span>
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center">
        <span className="text-siso-text/70">Dashboard</span>
        <span className="mx-2 text-siso-text/40">/</span>
        <span className="text-siso-text">Home</span>
      </div>
    </motion.div>
  );
}
