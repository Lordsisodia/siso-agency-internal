import React from "react";
import { 
  Bell, 
  Home, 
  HelpCircle, 
  Settings, 
  Shield, 
  Mail, 
  User, 
  FileText, 
  Lock,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  Briefcase
} from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

/**
 * Demo implementations of the ExpandableTabs component
 * Perfect for mobile navigation and compact interfaces
 */

export function DefaultDemo() {
  const tabs = [
    { title: "Dashboard", icon: Home },
    { title: "Notifications", icon: Bell },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Support", icon: HelpCircle },
    { title: "Security", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Default Navigation</h3>
      <ExpandableTabs 
        tabs={tabs}
        onChange={(index) => console.log('Selected tab:', index)}
      />
    </div>
  );
}

export function CustomColorDemo() {
  const tabs = [
    { title: "Profile", icon: User },
    { title: "Messages", icon: Mail },
    { type: "separator" as const },
    { title: "Documents", icon: FileText },
    { title: "Privacy", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Custom Blue Theme</h3>
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-blue-500"
        className="border-blue-200 dark:border-blue-800" 
        onChange={(index) => console.log('Selected tab:', index)}
      />
    </div>
  );
}

export function MobileNavigationDemo() {
  const tabs = [
    { title: "Home", icon: Home },
    { title: "Tasks", icon: FileText },
    { title: "Calendar", icon: Calendar },
    { type: "separator" as const },
    { title: "Analytics", icon: BarChart3 },
    { title: "Team", icon: Users },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Mobile Bottom Navigation</h3>
      <div className="fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:left-auto md:right-auto">
        <ExpandableTabs 
          tabs={tabs}
          activeColor="text-orange-500"
          className="bg-white/90 backdrop-blur-sm border-orange-200 shadow-lg"
          onChange={(index) => {
            console.log('Mobile nav selected:', index);
            // Handle navigation logic here
          }}
        />
      </div>
    </div>
  );
}

export function SISOInternalNavigationDemo() {
  const [activeTab, setActiveTab] = React.useState(1); // Life Lock tab active
  
  const tabs = [
    { title: "Dashboard", icon: Home },
    { title: "Life Lock", icon: Shield },
    { title: "Tasks", icon: FileText },
    { type: "separator" as const },
    { title: "Messages", icon: MessageSquare },
    { title: "Projects", icon: Briefcase },
    { title: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">SISO Internal Navigation (with activeIndex)</h3>
      <ExpandableTabs 
        tabs={tabs}
        activeIndex={activeTab}
        activeColor="text-siso-orange"
        className="bg-siso-bg border-siso-border shadow-lg"
        onChange={(index) => {
          if (index !== null) {
            setActiveTab(index);
            const routes = [
              '/', // Dashboard
              '/admin/life-lock', // Life Lock
              '/admin/tasks', // Tasks
              null, // Separator
              '/communication', // Messages  
              '/projects', // Projects
              '/admin/settings', // Settings
            ];
            
            const route = routes[index];
            if (route) {
              console.log('Navigate to:', route);
              // You would use react-router or your navigation solution here
              // Example: navigate(route);
            }
          }
        }}
      />
    </div>
  );
}

export function CompactSidebarDemo() {
  const tabs = [
    { title: "Overview", icon: BarChart3 },
    { title: "Calendar", icon: Calendar },
    { title: "Messages", icon: MessageSquare },
    { title: "Profile", icon: User },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Compact Sidebar Navigation</h3>
      <div className="w-fit">
        <ExpandableTabs 
          tabs={tabs}
          activeColor="text-green-500"
          className="flex-col gap-1 w-fit border-green-200"
          onChange={(index) => console.log('Sidebar selected:', index)}
        />
      </div>
    </div>
  );
}

// Combined demo component
export function ExpandableTabsShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Expandable Tabs Showcase</h2>
        <p className="text-muted-foreground">
          Interactive navigation components with smooth animations
        </p>
      </div>
      
      <DefaultDemo />
      <CustomColorDemo />
      <MobileNavigationDemo />
      <SISOInternalNavigationDemo />
      <CompactSidebarDemo />
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Integration Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Perfect for mobile bottom navigation bars</li>
          <li>• Use separators to group related navigation items</li>
          <li>• Customize activeColor to match your brand</li>
          <li>• Handle onChange to integrate with your routing solution</li>
          <li>• Great for compact sidebar navigation in dashboard layouts</li>
        </ul>
      </div>
    </div>
  );
}