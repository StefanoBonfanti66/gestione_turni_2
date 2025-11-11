import React, { useState } from 'react';
import { View } from './types';
import { useMockData } from './hooks/useMockData';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { Dashboard } from './components/Dashboard';
import { Anagraphics } from './components/Anagraphics';
import { History } from './components/History';
import { RequestsView } from './components/RequestsView';
import { Notification } from './components/Notification';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';

type NotificationType = 'success' | 'info' | 'error';
interface AppNotification {
    id: number;
    message: string;
    type: NotificationType;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (message: string, type: NotificationType = 'info') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const { departments, machines, workers, shifts, history, leaveRequests, addShift, deleteShift, updateShift, addWorker, updateWorker, deleteWorker, addMachine, updateMachine, deleteMachine, addLeaveRequest, updateLeaveRequestStatus } = useMockData(addNotification);
  const [theme, toggleTheme] = useTheme();

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView shifts={shifts} machines={machines} workers={workers} departments={departments} onUpdateShift={updateShift} onAddShift={addShift} onDeleteShift={deleteShift} />;
      case 'dashboard':
        return <Dashboard shifts={shifts} workers={workers} departments={departments} machines={machines} />;
      case 'anagraphics':
        return <Anagraphics workers={workers} machines={machines} departments={departments} shifts={shifts} onAddWorker={addWorker} onUpdateWorker={updateWorker} onDeleteWorker={deleteWorker} onAddMachine={addMachine} onUpdateMachine={updateMachine} onDeleteMachine={deleteMachine} />;
      case 'requests':
        return <RequestsView workers={workers} leaveRequests={leaveRequests} onAddRequest={addLeaveRequest} onUpdateRequestStatus={updateLeaveRequestStatus} />;
      case 'history':
        return <History history={history} />;
      default:
        return <CalendarView shifts={shifts} machines={machines} workers={workers} departments={departments} onUpdateShift={updateShift} onAddShift={addShift} onDeleteShift={deleteShift} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex justify-end items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
           <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
           </button>
        </header>
        <div className="flex-1 overflow-y-auto">
            {renderView()}
        </div>
        {/* Notification Container */}
        <div className="fixed top-20 right-4 z-50 w-full max-w-sm space-y-2">
            {notifications.map(n => (
                <Notification key={n.id} {...n} onDismiss={removeNotification} />
            ))}
        </div>
      </main>
    </div>
  );
};

export default App;
