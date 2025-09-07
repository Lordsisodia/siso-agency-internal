import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Network, GraduationCap, Wrench, Users, Bot } from 'lucide-react';

const LearnNetwork = () => {
  const sections = [
    {
      title: "Education",
      description: "Access educational resources and tutorials",
      path: "/education",
      icon: GraduationCap
    },
    {
      title: "AI Assistants",
      description: "Access specialized AI assistants",
      path: "/assistants",
      icon: Bot
    },
    {
      title: "Tools",
      description: "Discover and use AI tools",
      path: "/tools",
      icon: Wrench
    },
    {
      title: "Networking",
      description: "Connect with other members",
      path: "/networking",
      icon: Users
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Network className="w-8 h-8 text-siso-orange" />
        <h1 className="text-3xl font-bold text-siso-text-bold">Learn & Network</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card className="p-6 bg-black/20 border-siso-text/10 backdrop-blur-sm hover:border-siso-text/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <section.icon className="w-5 h-5 text-siso-orange" />
                <h2 className="text-xl font-semibold text-siso-text-bold">{section.title}</h2>
              </div>
              <p className="text-siso-text/80">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LearnNetwork;