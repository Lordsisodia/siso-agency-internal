
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function CalendarCard() {
  const navigate = useNavigate();
  
  // These would come from your actual calendar data
  const upcomingEvents = [
    {
      id: 1,
      title: "Client Meeting",
      time: "10:00 AM",
      description: "Project kickoff with NewClient Inc."
    },
    {
      id: 2,
      title: "Team Standup",
      time: "2:00 PM",
      description: "Weekly progress review"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/calendar')}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <CalendarIcon className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} className="bg-black/20 border border-siso-text/10 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="flex items-center text-xs text-siso-orange">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <div className="text-xs text-siso-text">{event.description}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-siso-text">
              No events scheduled for today
            </div>
          )}
          
          <button 
            className="w-full py-2 text-sm text-siso-orange hover:text-white transition-colors"
          >
            View Full Calendar
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
