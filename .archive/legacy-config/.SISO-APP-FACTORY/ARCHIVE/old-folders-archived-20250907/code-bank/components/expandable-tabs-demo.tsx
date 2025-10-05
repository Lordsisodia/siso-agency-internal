/**
 * Expandable Tabs Demo Components
 * 
 * Example implementations of the ExpandableTabs component
 */

import { Bell, Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

function DefaultDemo() {
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
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

function CustomColorDemo() {
  const tabs = [
    { title: "Profile", icon: User },
    { title: "Messages", icon: Mail },
    { type: "separator" as const },
    { title: "Documents", icon: FileText },
    { title: "Privacy", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ExpandableTabs 
        tabs={tabs} 
        activeColor="text-blue-500"
        className="border-blue-200 dark:border-blue-800" 
      />
    </div>
  );
}

function MobileNavigationDemo() {
  const tabs = [
    { title: "Today", icon: Home },
    { title: "Tasks", icon: FileText },
    { type: "separator" as const },
    { title: "Voice", icon: Bell },
    { title: "Stats", icon: Shield },
    { title: "More", icon: Settings }
  ];

  const handleTabChange = (index: number | null) => {
    console.log("Selected tab index:", index);
    // Handle navigation here
  };

  return (
    <div className="fixed bottom-4 left-4 right-4">
      <ExpandableTabs 
        tabs={tabs}
        onChange={handleTabChange}
        activeColor="text-yellow-400"
        className="bg-gray-800/60 border-gray-600/50"
      />
    </div>
  );
}

export { DefaultDemo, CustomColorDemo, MobileNavigationDemo };