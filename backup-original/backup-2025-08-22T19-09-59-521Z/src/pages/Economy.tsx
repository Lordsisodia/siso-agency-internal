import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Coins, Trophy, ArrowRightLeft } from 'lucide-react';

const Economy = () => {
  const sections = [
    {
      title: "How to Earn",
      description: "Learn different ways to earn points",
      path: "/economy/earn",
      icon: Coins
    },
    {
      title: "Crypto Exchange",
      description: "Convert your points to crypto",
      path: "/economy/crypto-exchange",
      icon: ArrowRightLeft
    },
    {
      title: "Leaderboards",
      description: "See top earners and rankings",
      path: "/economy/leaderboards",
      icon: Trophy
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Coins className="w-8 h-8 text-siso-orange" />
        <h1 className="text-3xl font-bold text-siso-text-bold">Economy</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default Economy;