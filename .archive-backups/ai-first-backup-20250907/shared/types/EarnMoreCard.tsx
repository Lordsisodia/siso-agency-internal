
import { Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EarnMoreCard = () => {
  return (
    <Link 
      to="/economy/earn"
      className="block w-full p-4 mb-6 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 
        border border-siso-border hover:border-siso-border-hover rounded-lg 
        transition-all duration-300 group hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-siso-orange" />
          <div>
            <h3 className="text-lg font-semibold text-siso-text-bold">
              Want to climb the leaderboard?
            </h3>
            <p className="text-sm text-siso-text/80">
              Learn how to earn more points and reach the top!
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-siso-orange transform transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};
