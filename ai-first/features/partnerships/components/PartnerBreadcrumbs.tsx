import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { usePartnerNavigation } from '@/hooks/usePartnerNavigation';

export function PartnerBreadcrumbs() {
  const { breadcrumbs } = usePartnerNavigation();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on dashboard home
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.name}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          
          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center hover:text-white transition-colors"
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.name}
            </Link>
          ) : (
            <span className="flex items-center text-white font-medium">
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 