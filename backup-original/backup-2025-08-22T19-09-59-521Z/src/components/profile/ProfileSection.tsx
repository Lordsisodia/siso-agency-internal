
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProfileSectionProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const ProfileSection = ({ label, children, className }: ProfileSectionProps) => {
  return (
    <motion.div 
      className={cn("space-y-1", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm text-siso-text/70">{label}</p>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
