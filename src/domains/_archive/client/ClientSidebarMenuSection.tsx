
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ClientSidebarMenuSectionProps {
  section: any;
  isItemActive: (href: string, isMain?: boolean) => boolean;
  onItemClick: () => void;
  collapsed: boolean;
}

export function ClientSidebarMenuSection({
  section,
  isItemActive,
  onItemClick,
  collapsed,
}: ClientSidebarMenuSectionProps) {
  const navigate = useNavigate();

  if (section.type === "main") {
    return (
      <motion.div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isItemActive(section.href, true)}>
              <a
                href={section.href}
                onClick={e => {
                  e.preventDefault();
                  navigate(section.href);
                  onItemClick();
                }}
                className="flex items-center gap-3 w-full"
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </motion.div>
    );
  }

  if (section.type === "section") {
    return (
      <motion.div className="space-y-1 border-b border-purple-900/20 pb-2">
        <SidebarGroup>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items?.map((item: any) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.href)}>
                    <a
                      href={item.href}
                      onClick={e => {
                        e.preventDefault();
                        navigate(item.href);
                        onItemClick();
                      }}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </motion.div>
    );
  }

  return null;
}
