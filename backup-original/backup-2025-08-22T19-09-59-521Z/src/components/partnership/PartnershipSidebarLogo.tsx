import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const logoVariants = cva("transition-all", {
  variants: {
    expanded: {
      true: "w-40 justify-start",
      false: "w-16 justify-center",
    },
  },
  defaultVariants: {
    expanded: true,
  },
});

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof logoVariants> {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  onLogoClick?: () => void;
  tooltip?: boolean;
  link?: string;
  className?: string;
  navigationMode?: 'partnership' | 'affiliate';
}

interface LogoLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}

const LogoLink = ({ children, href = "/partner", className, onClick }: LogoLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div className={cn("flex items-center cursor-pointer", className)} onClick={handleClick}>
      {children}
    </div>
  );
};

export function PartnershipSidebarLogo({
  collapsed = false,
  setCollapsed,
  onLogoClick,
  tooltip = false,
  link = "/partner",
  className,
  navigationMode = 'partnership',
  ...props
}: LogoProps) {
  // Convert collapsed to expanded for internal use
  const expanded = !collapsed;
  
  const handleLogoClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const handleToggleCollapse = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    }
  };

  const Logo = () => (
    <div
      className={cn(
        "flex items-center px-4 py-1.5 min-h-14",
        logoVariants({ expanded }),
        !expanded && "px-2",
        className
      )}
      onClick={handleToggleCollapse}
      role="button"
      {...props}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "flex items-center",
          !expanded && "justify-center w-full"
        )}
      >
        <img 
          src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
          alt="SISO AGENCY" 
          className={cn(
            "w-9 h-9",
            !expanded && "mx-auto"
          )} 
        />
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="ml-2.5 font-semibold text-lg whitespace-nowrap text-siso-text-bold"
          >
            SISO{" "}
            <span className="font-extrabold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
              {navigationMode === 'affiliate' ? 'AFFILIATE' : 'PARTNER'}
            </span>
          </motion.span>
        )}
      </motion.div>
    </div>
  );

  if (tooltip && !expanded) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="cursor-pointer">
              <LogoLink href={link} onClick={handleLogoClick}>
                <Logo />
              </LogoLink>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5} className="bg-primary text-primary-foreground">
            SISO {navigationMode === 'affiliate' ? 'AFFILIATE' : 'PARTNER'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <LogoLink href={link} onClick={handleLogoClick}>
      <Logo />
    </LogoLink>
  );
}

// Make this the default export to maintain backward compatibility
export { PartnershipSidebarLogo as default };