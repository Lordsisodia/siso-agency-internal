
import { BookOpen, HelpCircle, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from '@/components/ui/nav-link';
import { useLocation } from 'react-router-dom';

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const helpNavItems: NavItem[] = [
  {
    title: "Getting Started",
    href: "/resources/help/getting-started",
    icon: BookOpen,
  },
  {
    title: "FAQ",
    href: "/resources/help/faq",
    icon: HelpCircle,
  },
  {
    title: "Documentation",
    href: "/resources/help/documentation",
    icon: List,
  }
];

export function HelpNavigation() {
  const location = useLocation();
  
  return (
    <nav className="flex flex-col gap-2 p-4 bg-black/20 rounded-lg border border-border/5">
      <h2 className="font-semibold text-lg px-4 mb-2">Help Center</h2>
      {helpNavItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            location.pathname === item.href && "bg-accent text-accent-foreground"
          )}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
