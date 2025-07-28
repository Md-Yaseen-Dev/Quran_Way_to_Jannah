import React from 'react';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'surah', label: 'Surah' },
    { id: 'para', label: 'Para' },
    { id: 'topics', label: 'Topics' },
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "border-b-2 py-2 px-1 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
