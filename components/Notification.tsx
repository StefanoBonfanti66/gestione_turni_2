import React, { useEffect, useState } from 'react';
import { classNames } from '../utils/helpers';

export interface NotificationProps {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
  onDismiss: (id: number) => void;
}

/**
 * A toast-like notification component.
 * NOTE: This component simulates a push notification for the frontend.
 * A real-world implementation would require a service worker and a backend service
 * like Firebase Cloud Messaging (FCM) to deliver notifications to devices.
 */
export const Notification: React.FC<NotificationProps> = ({ id, message, type, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setVisible(true);
    
    const timer = setTimeout(() => {
      // Animate out
      setVisible(false);
      // Wait for fade-out animation to complete before removing from DOM
      setTimeout(() => onDismiss(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ease-in-out';
  const typeClasses = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
  };
  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full';

  return (
    <div className={classNames(baseClasses, typeClasses[type], visibilityClasses)}>
      <p className="font-medium">{message}</p>
    </div>
  );
};