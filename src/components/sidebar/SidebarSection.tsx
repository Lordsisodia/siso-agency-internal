import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarSectionHeader } from './SidebarSectionHeader';
import { MenuSection } from './types';

interface SidebarSectionProps {
  section: MenuSection;
  collapsed: boolean;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  isItemActive: (href: string) => boolean;
}

export const SidebarSection = ({ 
  section, 
  collapsed, 
  onItemClick, 
  isItemActive 
}: SidebarSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (section.type === 'main') {
    return (
      <SidebarMenuItem
        href={section.href!}
        icon={section.icon}
        label={section.label!}
        collapsed={collapsed}
        onClick={onItemClick}
        isMain={true}
        isActive={isItemActive(section.href!)}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {!collapsed && section.title && (
        <SidebarSectionHeader icon={section.icon} title={section.title} />
      )}
      <motion.div 
        className={cn(
          "space-y-0.5",
          !collapsed && "pl-2 border-l-2 border-siso-border ml-3"
        )}
        variants={containerVariants}
      >
        {section.items?.map((item, index) => (
          <SidebarMenuItem
            key={index}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            onClick={onItemClick}
            isActive={isItemActive(item.href)}
          />
        ))}
      </motion.div>
    </div>
  );
};
