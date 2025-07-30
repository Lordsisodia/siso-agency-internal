
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import { useEffect, useState } from "react";
import { SidebarContent } from "@/components/ui/sidebar";
import { clientMenuSections } from "./clientMenuSections";
import { ClientSidebarMenuSection } from "./ClientSidebarMenuSection";

export function ClientSidebarNavigation({ collapsed = false, onItemClick = () => {}, visible = true }) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (location.hash) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(`#${entry.target.id}`);
            }
          });
        },
        { threshold: 0.5 }
      );
      document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
      });
      return () => observer.disconnect();
    }
  }, [location.hash]);

  const isItemActive = (href: string, isMain: boolean = false) => {
    if (!href) return false;
    const currentPath = location.pathname.replace(/\/$/, "");
    const targetPath = href.replace(/\/$/, "");
    const exactMatch = currentPath === targetPath;
    const isChildPath = currentPath.startsWith(targetPath + "/");
    if (isMain) {
      return exactMatch || isChildPath;
    }
    return exactMatch;
  };

  if (!visible) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <SidebarContent>
      <motion.nav
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className={cn("px-2 py-4", collapsed && "px-1")}
      >
        <div className="space-y-2">
          {clientMenuSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ClientSidebarMenuSection
                section={section}
                isItemActive={isItemActive}
                onItemClick={onItemClick}
                collapsed={collapsed}
              />
            </motion.div>
          ))}
        </div>
      </motion.nav>
    </SidebarContent>
  );
}
