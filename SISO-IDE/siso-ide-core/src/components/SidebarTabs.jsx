import React from 'react';
import { MessageSquare, Folder, Search } from 'lucide-react';
import { cn } from '../lib/utils';

function SidebarTabs({ activeTab, onTabChange, searchValue, onSearchChange, className = '' }) {
  const tabs = [
    {
      id: 'sessions',
      label: 'Sessions',
      icon: MessageSquare,
      searchPlaceholder: 'Search sessions...'
    },
    {
      id: 'files',
      label: 'Recent',
      icon: Folder,
      searchPlaceholder: 'Search sessions...'
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tab Buttons */}
      <div className="flex bg-muted/50 rounded-lg p-1 mb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={activeTabConfig?.searchPlaceholder || 'Search...'}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:bg-background focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-muted-foreground"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded"
          >
            <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default SidebarTabs;