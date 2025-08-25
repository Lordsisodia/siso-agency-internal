
import { forwardRef } from "react";
import { Link, LinkProps, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<LinkProps, "to"> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, className, children, onClick, ...props }, ref) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
      if (href.startsWith("/")) {
        navigate(href);
      } else {
        window.location.href = href;
      }
    };

    return (
      <Link
        ref={ref}
        to={href}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";
