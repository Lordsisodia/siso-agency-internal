
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/client/useIsClient";
import { Briefcase } from "lucide-react";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardNavbar() {
  const location = useLocation();
  const { handleSignOut } = useSupabaseAuth();
  const { isClient, loading: clientLoading } = useIsClient();

  const NavItem = ({ href, children, className }: NavItemProps) => {
    const isActive = location.pathname === href;
    return (
      <Link
        to={href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-foreground/80",
          isActive
            ? "text-foreground"
            : "text-foreground/60",
          className
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <NavItem href="/home">Dashboard</NavItem>
      <NavItem href="/my-projects">Projects</NavItem>
      <NavItem href="/portfolio">Portfolio</NavItem>
      
      {/* Client dashboard link - shown to all users but with conditional content */}
      <NavItem 
        href="/client-dashboard"
        className={cn(
          "flex items-center gap-1",
          isClient && "text-orange-400 hover:text-orange-300"
        )}
      >
        <Briefcase className="h-3.5 w-3.5" />
        <span>Client Area</span>
        {isClient && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
      </NavItem>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="ml-4"
      >
        Logout
      </Button>
    </div>
  );
}
