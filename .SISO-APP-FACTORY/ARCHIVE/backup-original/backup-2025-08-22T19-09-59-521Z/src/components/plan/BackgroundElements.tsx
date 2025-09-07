
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  DollarSign, 
  Camera, 
  Video, 
  Image,
  Trophy 
} from 'lucide-react';

interface BackgroundIconProps {
  icon: React.ElementType;
  delay: number;
  x: string;
  y: string;
  opacity: number;
  size: number;
}

export const BackgroundIcon = ({ icon, delay, x, y, opacity, size }: BackgroundIconProps) => {
  const Icon = icon;
  return (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: opacity, 
        scale: 1,
        x: x,
        y: y
      }}
      transition={{ 
        delay: delay, 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: Math.random() * 10 + 5
      }}
    >
      <Icon className="text-siso-orange/10" size={size} />
    </motion.div>
  );
};

export const WelcomeBackground = () => {
  const bgIcons = [
    { icon: Users, x: "10%", y: "15%", opacity: 0.08, size: 60, delay: 0.2 },
    { icon: Image, x: "85%", y: "25%", opacity: 0.05, size: 48, delay: 1.5 },
    { icon: Calendar, x: "20%", y: "80%", opacity: 0.07, size: 54, delay: 0.8 },
    { icon: DollarSign, x: "75%", y: "75%", opacity: 0.06, size: 64, delay: 2.3 },
    { icon: MessageSquare, x: "60%", y: "20%", opacity: 0.06, size: 56, delay: 3.1 },
    { icon: Camera, x: "25%", y: "35%", opacity: 0.04, size: 52, delay: 1.2 },
    { icon: Video, x: "40%", y: "65%", opacity: 0.05, size: 58, delay: 2.8 },
    { icon: Trophy, x: "80%", y: "50%", opacity: 0.07, size: 62, delay: 0.5 },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 z-0" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] z-0" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full bg-siso-orange/5"
          initial={{ x: "30%", y: "20%" }}
          animate={{ 
            x: "35%", 
            y: "25%",
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            repeatType: "reverse",
          }}
        />
        <motion.div 
          className="absolute w-[300px] h-[300px] rounded-full bg-siso-red/5"
          initial={{ x: "70%", y: "60%" }}
          animate={{ 
            x: "65%", 
            y: "55%",  
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse", 
          }}
        />
      </div>
      
      {/* Icons */}
      {bgIcons.map((iconProps, i) => (
        <BackgroundIcon key={i} {...iconProps} />
      ))}
    </div>
  );
};
