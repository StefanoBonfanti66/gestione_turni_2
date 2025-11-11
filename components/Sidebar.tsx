import React from 'react';
import { View } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ClockIcon } from './icons/ClockIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { classNames } from '../utils/helpers';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navigationItems = [
  { view: 'calendar', label: 'Calendario Turni', icon: CalendarIcon },
  { view: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { view: 'anagraphics', label: 'Anagrafiche', icon: UsersIcon },
  { view: 'requests', label: 'Ferie e Permessi', icon: DocumentTextIcon },
  { view: 'history', label: 'Storico', icon: ClockIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ShiftPro</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => (
          <a
            key={item.view}
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(item.view); }}
            className={classNames(
              'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200',
              currentView === item.view
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};